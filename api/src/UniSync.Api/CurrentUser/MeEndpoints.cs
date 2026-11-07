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

public static class MeEndpoints
{
    public static RouteGroupBuilder MapMeEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/me", GetMeAsync).WithTags("Me").RequireAuthorization().Returns<MeResponse>();
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

        return ApiResponse.Ok(http, "OK", new MeResponse(
            account.Id, account.Phone, account.Role,
            profile?.FirstName, profile?.LastName, profile?.StudentId,
            profile?.DepartmentId, profile?.BatchId, section, isCr));
    }
}
