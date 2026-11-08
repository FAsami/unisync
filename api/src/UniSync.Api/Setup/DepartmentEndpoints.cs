using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record DepartmentView(Guid Id, string Code, string Name, string? Description, bool IsActive);

public sealed record DepartmentBody(string? Code, string? Name, string? Description);

public sealed record SectionView(Guid Id, Guid BatchId, string Name, int? Capacity, bool IsActive, int StudentCount);

public sealed record BatchView(
    Guid Id, string Name, int Year, int CurrentSemester, int SemesterCount,
    DateOnly? StartDate, DateOnly? EndDate, bool IsActive, int StudentCount, IReadOnlyList<SectionView> Sections);

public sealed record BatchBody(
    string? Name, int? Year, int? CurrentSemester, int? SemesterCount, string? StartDate, string? EndDate, bool? IsActive);

public sealed record SectionBody(Guid? BatchId, string? Name, int? Capacity, bool? IsActive);

/// <summary>
/// The department admin's own department and its structure: batches (an intake
/// year, moving through semesters) and their sections. Students belong to a section.
/// </summary>
public static partial class DepartmentEndpoints
{
    private const int MaxName = 100;

    public static RouteGroupBuilder MapDepartmentSetupEndpoints(this RouteGroupBuilder api)
    {
        var department = api.MapDepartmentAdminGroup("/department", "Setup: department");
        department.MapGet("/", GetDepartmentAsync).Returns<DepartmentView>();
        department.MapPatch("/", UpdateDepartmentAsync).Returns<DepartmentView>();

        var batches = api.MapDepartmentAdminGroup("/batches", "Setup: batches and sections");
        batches.MapGet("/", ListBatchesAsync).Returns<List<BatchView>>();
        batches.MapGet("/{id:guid}", GetBatchAsync).Returns<BatchView>();
        batches.MapPost("/", CreateBatchAsync).Returns<BatchView>(StatusCodes.Status201Created);
        batches.MapPatch("/{id:guid}", UpdateBatchAsync).Returns<BatchView>();
        batches.MapDelete("/{id:guid}", DeleteBatchAsync).Returns<DeletedResult>();

        var sections = api.MapDepartmentAdminGroup("/sections", "Setup: batches and sections");
        sections.MapPost("/", CreateSectionAsync).Returns<SectionView>(StatusCodes.Status201Created);
        sections.MapPatch("/{id:guid}", UpdateSectionAsync).Returns<SectionView>();
        sections.MapDelete("/{id:guid}", DeleteSectionAsync).Returns<DeletedResult>();
        return api;
    }

    // ---------------------------------------------------------------- department

    private static async Task<IResult> GetDepartmentAsync(HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var d = await db.Departments.AsNoTracking().FirstAsync(x => x.Id == departmentId, ct);
        return ApiResponse.Ok(http, "OK", View(d));
    }

    private static async Task<IResult> UpdateDepartmentAsync(DepartmentBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var code = SetupScope.Clean(body.Code)?.ToUpperInvariant();
        var name = SetupScope.Clean(body.Name);
        var errors = new Dictionary<string, string>();
        if (code is not null && !CodePattern().IsMatch(code))
        {
            errors["code"] = "Use 2–16 letters, numbers or dashes, like CSE.";
        }

        SetupScope.RequiredIfSent(errors, "name", name, MaxName, "Enter the department's name.");
        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        var d = await db.Departments.FirstAsync(x => x.Id == departmentId, ct);
        d.Code = code ?? d.Code;
        d.Name = name ?? d.Name;
        if (body.Description is not null)
        {
            d.Description = SetupScope.Optional(body.Description);
        }

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "department_code_key"))
        {
            return SetupScope.Exists(http, $"Another department already uses the code {code}.");
        }

        return ApiResponse.Ok(http, "Saved", View(d));
    }

    private static DepartmentView View(Department d) => new(d.Id, d.Code, d.Name, d.Description, d.IsActive);

    // ---------------------------------------------------------------- batches

    private static async Task<IResult> ListBatchesAsync(HttpContext http, UniSyncDbContext db, bool? active, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var query = db.Batches.AsNoTracking().Where(b => b.DepartmentId == departmentId);
        if (active is { } a)
        {
            query = query.Where(b => b.IsActive == a);
        }

        var batches = await query.OrderByDescending(b => b.Year).ThenBy(b => b.Name).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", await ViewsAsync(db, batches, ct));
    }

    private static async Task<IResult> GetBatchAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var batch = await FindBatchAsync(db, SetupScope.DepartmentId(http), id, ct);
        return batch is null ? BatchNotFound(http) : ApiResponse.Ok(http, "OK", (await ViewsAsync(db, [batch], ct))[0]);
    }

    private static async Task<IResult> CreateBatchAsync(BatchBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var batch = new Batch { DepartmentId = departmentId, IsActive = body.IsActive ?? true };
        if (Apply(batch, body, creating: true) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        if (await NameTakenAsync(db, departmentId, batch.Name, null, ct))
        {
            return SetupScope.Exists(http, $"There's already a batch called {batch.Name}.");
        }

        db.Batches.Add(batch);
        await db.SaveChangesAsync(ct);
        return ApiResponse.Ok(http, "Batch added", (await ViewsAsync(db, [batch], ct))[0], StatusCodes.Status201Created);
    }

    private static async Task<IResult> UpdateBatchAsync(Guid id, BatchBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var batch = await db.Batches.FirstOrDefaultAsync(b => b.Id == id && b.DepartmentId == departmentId, ct);
        if (batch is null)
        {
            return BatchNotFound(http);
        }

        if (Apply(batch, body, creating: false) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        batch.IsActive = body.IsActive ?? batch.IsActive;
        if (await NameTakenAsync(db, departmentId, batch.Name, batch.Id, ct))
        {
            return SetupScope.Exists(http, $"There's already a batch called {batch.Name}.");
        }

        await db.SaveChangesAsync(ct);
        return ApiResponse.Ok(http, "Saved", (await ViewsAsync(db, [batch], ct))[0]);
    }

    private static async Task<IResult> DeleteBatchAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var batch = await FindBatchAsync(db, departmentId, id, ct);
        if (batch is null)
        {
            return BatchNotFound(http);
        }

        // Deleting cascades to sections, offerings and requests; only allow it for a batch nothing uses yet.
        if (await db.Profiles.AnyAsync(p => p.BatchId == id, ct)
            || await db.CourseOfferings.AnyAsync(o => o.BatchId == id, ct)
            || await db.AccessRequests.AnyAsync(r => r.BatchId == id, ct))
        {
            return SetupScope.InUse(http, "This batch has students, classes or access requests. Mark it inactive instead.");
        }

        await db.Batches.Where(b => b.Id == id).ExecuteDeleteAsync(ct);
        return ApiResponse.Ok(http, "Batch deleted", new DeletedResult(id));
    }

    /// <summary>Copies sent fields onto the batch and validates the result. Returns field errors.</summary>
    private static Dictionary<string, string> Apply(Batch batch, BatchBody body, bool creating)
    {
        var errors = new Dictionary<string, string>();
        var name = SetupScope.Clean(body.Name);
        if (creating)
        {
            SetupScope.Required(errors, "name", name, 50, "Enter the batch name, like 2026 or 52nd.");
        }
        else
        {
            SetupScope.RequiredIfSent(errors, "name", name, 50, "Enter the batch name, like 2026 or 52nd.");
        }

        if (creating && body.Year is null)
        {
            errors["year"] = "Enter the intake year.";
        }

        if (creating && body.SemesterCount is null)
        {
            errors["semesterCount"] = "Enter how many semesters the programme has.";
        }

        batch.Name = name ?? batch.Name;
        batch.Year = body.Year ?? batch.Year;
        batch.SemesterCount = body.SemesterCount ?? batch.SemesterCount;
        batch.CurrentSemester = body.CurrentSemester ?? (creating ? 1 : batch.CurrentSemester);
        if (body.StartDate is not null)
        {
            batch.StartDate = SetupScope.OptionalDate(errors, "startDate", body.StartDate);
        }

        if (body.EndDate is not null)
        {
            batch.EndDate = SetupScope.OptionalDate(errors, "endDate", body.EndDate);
        }

        if (!errors.ContainsKey("year") && batch.Year is < 2000 or > 2100)
        {
            errors["year"] = "Enter a year between 2000 and 2100.";
        }

        if (!errors.ContainsKey("semesterCount") && batch.SemesterCount is < 1 or > 16)
        {
            errors["semesterCount"] = "A programme has 1 to 16 semesters.";
        }
        else if (batch.CurrentSemester < 1 || batch.CurrentSemester > batch.SemesterCount)
        {
            errors["currentSemester"] = $"The current semester must be between 1 and {batch.SemesterCount}.";
        }

        if (batch.StartDate is { } start && batch.EndDate is { } end && end < start)
        {
            errors["endDate"] = "The end date must be after the start date.";
        }

        return errors;
    }

    private static Task<bool> NameTakenAsync(UniSyncDbContext db, Guid departmentId, string name, Guid? except, CancellationToken ct) =>
        db.Batches.AnyAsync(b => b.DepartmentId == departmentId && b.Name == name && b.Id != except, ct);

    private static Task<Batch?> FindBatchAsync(UniSyncDbContext db, Guid departmentId, Guid id, CancellationToken ct) =>
        db.Batches.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id && b.DepartmentId == departmentId, ct);

    private static IResult BatchNotFound(HttpContext http) => SetupScope.NotFound(http, "Batch");

    private static async Task<List<BatchView>> ViewsAsync(UniSyncDbContext db, IReadOnlyList<Batch> batches, CancellationToken ct)
    {
        var batchIds = batches.Select(b => b.Id).ToList();
        var sections = await db.Sections.AsNoTracking().Where(s => batchIds.Contains(s.BatchId)).OrderBy(s => s.Name).ToListAsync(ct);
        var sectionIds = sections.Select(s => s.Id).ToList();
        var counts = await StudentCountsAsync(db, sectionIds, ct);
        return batches.Select(b =>
        {
            var mine = sections.Where(s => s.BatchId == b.Id).Select(s => SectionViewOf(s, counts)).ToList();
            return new BatchView(b.Id, b.Name, b.Year, b.CurrentSemester, b.SemesterCount, b.StartDate, b.EndDate, b.IsActive,
                mine.Sum(s => s.StudentCount), mine);
        }).ToList();
    }

    // ---------------------------------------------------------------- sections

    private static async Task<IResult> CreateSectionAsync(SectionBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var name = SetupScope.Clean(body.Name);
        var errors = new Dictionary<string, string>();
        SetupScope.Required(errors, "name", name, 50, "Enter the section name, like A.");
        if (body.BatchId is null)
        {
            errors["batchId"] = "Choose the batch.";
        }

        if (body.Capacity is < 1 or > 1000)
        {
            errors["capacity"] = "Capacity must be between 1 and 1000.";
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        if (await FindBatchAsync(db, departmentId, body.BatchId!.Value, ct) is null)
        {
            return BatchNotFound(http);
        }

        var section = new Section { BatchId = body.BatchId.Value, Name = name!, Capacity = body.Capacity, IsActive = body.IsActive ?? true };
        db.Sections.Add(section);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "section_batch_id_name_key"))
        {
            return SetupScope.Exists(http, $"This batch already has a section {name}.");
        }

        return ApiResponse.Ok(http, "Section added", SectionViewOf(section, []), StatusCodes.Status201Created);
    }

    private static async Task<IResult> UpdateSectionAsync(Guid id, SectionBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var section = await FindSectionAsync(db, SetupScope.DepartmentId(http), id, tracking: true, ct);
        if (section is null)
        {
            return SectionNotFound(http);
        }

        var name = SetupScope.Clean(body.Name);
        var errors = new Dictionary<string, string>();
        SetupScope.RequiredIfSent(errors, "name", name, 50, "Enter the section name, like A.");
        if (body.Capacity is < 1 or > 1000)
        {
            errors["capacity"] = "Capacity must be between 1 and 1000.";
        }

        if (body.BatchId is { } batchId && batchId != section.BatchId)
        {
            errors["batchId"] = "A section can't move to another batch. Add a new section there instead.";
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        section.Name = name ?? section.Name;
        section.Capacity = body.Capacity ?? section.Capacity;
        section.IsActive = body.IsActive ?? section.IsActive;
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "section_batch_id_name_key"))
        {
            return SetupScope.Exists(http, $"This batch already has a section {name}.");
        }

        return ApiResponse.Ok(http, "Saved", SectionViewOf(section, await StudentCountsAsync(db, [section.Id], ct)));
    }

    private static async Task<IResult> DeleteSectionAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        if (await FindSectionAsync(db, SetupScope.DepartmentId(http), id, tracking: false, ct) is null)
        {
            return SectionNotFound(http);
        }

        if (await db.Profiles.AnyAsync(p => p.SectionId == id, ct)
            || await db.CourseOfferings.AnyAsync(o => o.SectionId == id, ct)
            || await db.AccessRequests.AnyAsync(r => r.SectionId == id, ct))
        {
            return SetupScope.InUse(http, "This section has students, classes or access requests. Mark it inactive instead.");
        }

        await db.Sections.Where(s => s.Id == id).ExecuteDeleteAsync(ct);
        return ApiResponse.Ok(http, "Section deleted", new DeletedResult(id));
    }

    /// <summary>A section in the department (through its batch), or null.</summary>
    internal static Task<Section?> FindSectionAsync(UniSyncDbContext db, Guid departmentId, Guid id, bool tracking, CancellationToken ct)
    {
        var sections = tracking ? db.Sections : db.Sections.AsNoTracking();
        return (from s in sections
                join b in db.Batches on s.BatchId equals b.Id
                where s.Id == id && b.DepartmentId == departmentId
                select s).FirstOrDefaultAsync(ct);
    }

    private static IResult SectionNotFound(HttpContext http) => SetupScope.NotFound(http, "Section");

    private static SectionView SectionViewOf(Section s, Dictionary<Guid, int> counts) =>
        new(s.Id, s.BatchId, s.Name, s.Capacity, s.IsActive, counts.GetValueOrDefault(s.Id));

    /// <summary>Active, non-deleted students per section.</summary>
    private static Task<Dictionary<Guid, int>> StudentCountsAsync(UniSyncDbContext db, List<Guid> sectionIds, CancellationToken ct) =>
        (from p in db.Profiles
         join a in db.Accounts on p.UserId equals a.Id
         where p.SectionId != null && sectionIds.Contains(p.SectionId.Value) && (a.Role == "student" || a.Role == "class_representative") && a.IsActive && a.DeletedAt == null
         group p by p.SectionId!.Value into bySection
         select new { SectionId = bySection.Key, Count = bySection.Count() })
        .ToDictionaryAsync(x => x.SectionId, x => x.Count, ct);

    [GeneratedRegex("^[A-Z0-9-]{2,16}$")]
    internal static partial Regex CodePattern();
}
