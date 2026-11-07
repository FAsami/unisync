using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Academic;

public sealed record SectionItem(Guid Id, string Name);
public sealed record BatchItem(Guid Id, string Name, IReadOnlyList<SectionItem> Sections);
public sealed record DepartmentItem(Guid Id, string Code, string Name, IReadOnlyList<BatchItem> Batches);

/// <summary>
/// Public list of active departments → batches → sections. The access-request
/// form needs it before the person has an account. Names only, nothing personal.
/// </summary>
public static class DirectoryEndpoints
{
    public static RouteGroupBuilder MapDirectoryEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/directory", GetDirectoryAsync).WithTags("Directory");
        return api;
    }

    private static async Task<IResult> GetDirectoryAsync(HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departments = await db.Departments.AsNoTracking().Where(d => d.IsActive).OrderBy(d => d.Name).ToListAsync(ct);
        var batches = await db.Batches.AsNoTracking().Where(b => b.IsActive).OrderBy(b => b.Name).ToListAsync(ct);
        var sections = await db.Sections.AsNoTracking().Where(s => s.IsActive).OrderBy(s => s.Name).ToListAsync(ct);

        var sectionsByBatch = sections.ToLookup(s => s.BatchId);
        var batchesByDepartment = batches.ToLookup(b => b.DepartmentId);

        var result = departments.Select(d => new DepartmentItem(d.Id, d.Code, d.Name,
            [.. batchesByDepartment[d.Id].Select(b => new BatchItem(b.Id, b.Name,
                [.. sectionsByBatch[b.Id].Select(s => new SectionItem(s.Id, s.Name))]))])).ToList();

        return ApiResponse.Ok(http, "OK", result);
    }
}
