using System.Globalization;
using System.Security.Claims;
using UniSync.Api.Auth;
using UniSync.Api.Common;

namespace UniSync.Api.Schedule;

public sealed record TodayResponse(
    DateOnly Date,
    TimeOnly Now,
    string Scope,
    IReadOnlyList<ClassOccurrence> Classes,
    ClassOccurrence? Current,
    ClassOccurrence? Next);

public sealed record DaySchedule(DateOnly Date, IReadOnlyList<ClassOccurrence> Classes);

public sealed record WeekResponse(DateOnly From, DateOnly To, string Scope, IReadOnlyList<DaySchedule> Days);

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
        ClaimsPrincipal user, HttpContext http, ScheduleService schedule, CampusClock clock, CancellationToken ct)
    {
        var today = clock.Today;
        var now = clock.TimeOfDay;
        var (scope, classes) = await schedule.GetAsync(UserId(user), Role(user), today, today, ct);

        var happening = classes.Where(c => c.Happens).ToList();
        var current = happening.FirstOrDefault(c => c.Start <= now && now < c.End);
        var next = happening.FirstOrDefault(c => c.Start > now);

        return ApiResponse.Ok(http, "OK", new TodayResponse(today, now, scope, classes, current, next));
    }

    private static async Task<IResult> GetWeekAsync(
        ClaimsPrincipal user, HttpContext http, ScheduleService schedule, CampusClock clock, string? start, CancellationToken ct)
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

        return ApiResponse.Ok(http, "OK", new WeekResponse(from, to, scope, days));
    }

    private static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);

    private static string Role(ClaimsPrincipal user) => user.FindFirstValue(TokenService.RoleClaim) ?? "";
}
