using System.Globalization;
using System.Security.Claims;
using UniSync.Api.Auth;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Schedule;

public sealed record TodayResponse(
    DateOnly Date,
    TimeOnly Now,
    string Scope,
    IReadOnlyList<ClassOccurrence> Classes,
    ClassOccurrence? Current,
    ClassOccurrence? Next,
    bool CanChange);

public sealed record DaySchedule(DateOnly Date, IReadOnlyList<ClassOccurrence> Classes);

/// <param name="CanChange">True when the caller may cancel, move or re-room these classes (their teacher, or an active CR of the section).</param>
public sealed record WeekResponse(DateOnly From, DateOnly To, string Scope, IReadOnlyList<DaySchedule> Days, bool CanChange);

/// <summary>"My day" (UX review decision 2): only the user's own classes, changes already applied.</summary>
public static class ScheduleEndpoints
{
    private const int WeekLength = 7;

    public static RouteGroupBuilder MapScheduleEndpoints(this RouteGroupBuilder api)
    {
        var me = api.MapGroup("/me").WithTags("My day").RequireAuthorization();
        me.MapGet("/today", GetTodayAsync).Returns<TodayResponse>();
        me.MapGet("/week", GetWeekAsync).Returns<WeekResponse>();
        return api;
    }

    private static async Task<IResult> GetTodayAsync(
        ClaimsPrincipal user, HttpContext http, ScheduleService schedule, CampusClock clock, UniSyncDbContext db, CancellationToken ct)
    {
        var today = clock.Today;
        var now = clock.TimeOfDay;
        var (scope, classes) = await schedule.GetAsync(UserId(user), Role(user), today, today, ct);

        var happening = classes.Where(c => c.Happens).ToList();
        var current = happening.FirstOrDefault(c => c.Start <= now && now < c.End);
        var next = happening.FirstOrDefault(c => c.Start > now);

        return ApiResponse.Ok(http, "OK", new TodayResponse(today, now, scope, classes, current, next,
            await CanChangeAsync(UserId(user), scope, db, ct)));
    }

    private static async Task<IResult> GetWeekAsync(
        ClaimsPrincipal user, HttpContext http, ScheduleService schedule, CampusClock clock, UniSyncDbContext db, string? start, CancellationToken ct)
    {
        var from = clock.Today;
        if (start is not null && !DateOnly.TryParseExact(start, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out from))
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "start must be a date like 2026-11-09.");
        }

        var to = from.AddDays(WeekLength - 1);
        var (scope, classes) = await schedule.GetAsync(UserId(user), Role(user), from, to, ct);
        var byDate = classes.ToLookup(c => c.Date);
        var days = Enumerable.Range(0, WeekLength)
            .Select(i => from.AddDays(i))
            .Select(d => new DaySchedule(d, [.. byDate[d]]))
            .ToList();

        return ApiResponse.Ok(http, "OK", new WeekResponse(from, to, scope, days, await CanChangeAsync(UserId(user), scope, db, ct)));
    }

    /// <summary>
    /// The same people ClassChangeService.CanChangeAsync allows, for the classes this
    /// schedule shows: a teacher sees only their own classes; a student sees their
    /// section's, which they may change only as its active CR.
    /// </summary>
    private static async Task<bool> CanChangeAsync(Guid userId, string scope, UniSyncDbContext db, CancellationToken ct) =>
        scope == ScheduleScope.Teacher
        || (scope == ScheduleScope.Section
            && await db.Profiles.AnyAsync(p => p.UserId == userId && p.SectionId != null
                && db.ClassRepresentatives.Any(c => c.UserId == userId && c.SectionId == p.SectionId && c.IsActive), ct));

    private static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);

    private static string Role(ClaimsPrincipal user) => user.FindFirstValue(TokenService.RoleClaim) ?? "";
}
