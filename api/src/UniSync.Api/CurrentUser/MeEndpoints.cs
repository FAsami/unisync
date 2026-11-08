using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.CurrentUser;

public sealed record SectionRef(Guid Id, string Name);

public sealed record MeResponse(
    Guid Id,
    string Phone,
    string Role,
    string? FirstName,
    string? LastName,
    string? StudentId,
    Guid? DepartmentId,
    Guid? BatchId,
    SectionRef? Section,
    bool IsClassRepresentative);

public sealed record AccountDeleted(DateTimeOffset DeletedAt);

public static class MeEndpoints
{
    public static RouteGroupBuilder MapMeEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/me", GetMeAsync).WithTags("Me").RequireAuthorization().Returns<MeResponse>();
        api.MapDelete("/me", DeleteMeAsync).WithTags("Me").RequireAuthorization().Returns<AccountDeleted>()
            .WithSummary("Delete my account")
            .WithDescription("Soft delete (the store-required in-app deletion): the account can no longer sign in, every session is revoked and every device stops getting pushes. The roster record stays with the department.");
        return api;
    }

    private static async Task<IResult> GetMeAsync(ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);
        var account = await db.Accounts.AsNoTracking().FirstAsync(a => a.Id == userId, ct);
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);

        SectionRef? section = null;
        var isCr = false;
        if (profile?.SectionId is { } sectionId)
        {
            section = await db.Sections.AsNoTracking()
                .Where(s => s.Id == sectionId)
                .Select(s => new SectionRef(s.Id, s.Name))
                .FirstOrDefaultAsync(ct);
            // CR is a mark on a student for their own section, not a role.
            isCr = await db.ClassRepresentatives.AsNoTracking()
                .AnyAsync(c => c.UserId == userId && c.SectionId == sectionId && c.IsActive, ct);
        }

        // Teachers have no student profile; their name lives on the teacher record.
        var teacher = profile is null
            ? await db.TeacherProfiles.AsNoTracking().Where(t => t.UserId == userId)
                .Select(t => new { t.FirstName, t.LastName }).FirstOrDefaultAsync(ct)
            : null;

        return ApiResponse.Ok(http, "OK", new MeResponse(
            account.Id, account.Phone, account.Role,
            profile?.FirstName ?? teacher?.FirstName, profile?.LastName ?? teacher?.LastName, profile?.StudentId,
            profile?.DepartmentId, profile?.BatchId, section, isCr));
    }

    private static async Task<IResult> DeleteMeAsync(
        ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, TimeProvider time, CancellationToken ct)
    {
        var userId = Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);
        var now = time.GetUtcNow();

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Accounts.Where(a => a.Id == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsActive, false).SetProperty(a => a.DeletedAt, now), ct);
        // Signed out everywhere, this request's session included, and no more pushes.
        await db.Sessions.Where(s => s.UserId == userId && !s.Revoked)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Revoked, true), ct);
        await db.Devices.Where(d => d.UserId == userId && d.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(d => d.IsActive, false), ct);
        await transaction.CommitAsync(ct);

        return ApiResponse.Ok(http, "Your account has been deleted and you've been signed out everywhere.", new AccountDeleted(now));
    }
}
