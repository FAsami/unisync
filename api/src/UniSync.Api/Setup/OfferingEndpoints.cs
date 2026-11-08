using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record CourseRef(Guid Id, string Code, string Name);

public sealed record OfferingView(
    Guid Id, CourseRef Course, Ref Batch, Ref Section, Ref Teacher, string AcademicYear, bool IsActive, int RoutineCount);

public sealed record OfferingBody(Guid? CourseId, Guid? SectionId, Guid? TeacherId, string? AcademicYear, bool? IsActive);

/// <summary>
/// An offering is a course taught to one section by one teacher. Its weekly
/// classes are routine slots; students see them through their section.
/// </summary>
public static class OfferingEndpoints
{
    public static RouteGroupBuilder MapOfferingSetupEndpoints(this RouteGroupBuilder api)
    {
        var offerings = api.MapDepartmentAdminGroup("/offerings", "Setup: offerings and routine");
        offerings.MapGet("/", ListAsync).Returns<List<OfferingView>>();
        offerings.MapPost("/", CreateAsync).Returns<OfferingView>(StatusCodes.Status201Created);
        offerings.MapPatch("/{id:guid}", UpdateAsync).Returns<OfferingView>();
        offerings.MapDelete("/{id:guid}", DeleteAsync).Returns<DeletedResult>();
        return api;
    }

    private static async Task<IResult> ListAsync(
        HttpContext http, UniSyncDbContext db, Guid? batchId, Guid? sectionId, Guid? teacherId, Guid? courseId, bool? active,
        CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var query = InDepartment(db, departmentId);
        if (batchId is { } b)
        {
            query = query.Where(o => o.BatchId == b);
        }

        if (sectionId is { } s)
        {
            query = query.Where(o => o.SectionId == s);
        }

        if (teacherId is { } t)
        {
            query = query.Where(o => o.TeacherId == t);
        }

        if (courseId is { } c)
        {
            query = query.Where(o => o.CourseId == c);
        }

        if (active is { } a)
        {
            query = query.Where(o => o.IsActive == a);
        }

        var rows = await Project(db, query).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", rows.OrderBy(o => o.Batch.Name).ThenBy(o => o.Section.Name).ThenBy(o => o.Course.Code).ToList());
    }

    private static async Task<IResult> CreateAsync(OfferingBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var year = SetupScope.Clean(body.AcademicYear);
        var errors = new Dictionary<string, string>();
        if (body.CourseId is null)
        {
            errors["courseId"] = "Choose the course.";
        }

        if (body.SectionId is null)
        {
            errors["sectionId"] = "Choose the section.";
        }

        if (body.TeacherId is null)
        {
            errors["teacherId"] = "Choose the teacher.";
        }

        SetupScope.Required(errors, "academicYear", year, 20, "Enter the academic year, like 2026 or 2026-27.");
        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        if (!await db.Courses.AnyAsync(c => c.Id == body.CourseId && c.DepartmentId == departmentId, ct))
        {
            return SetupScope.NotFound(http, "Course");
        }

        var section = await DepartmentEndpoints.FindSectionAsync(db, departmentId, body.SectionId!.Value, tracking: false, ct);
        if (section is null)
        {
            return SetupScope.NotFound(http, "Section");
        }

        if (await TeacherProblemAsync(http, db, departmentId, body.TeacherId!.Value, ct) is { } problem)
        {
            return problem;
        }

        var offering = new CourseOffering
        {
            CourseId = body.CourseId!.Value, BatchId = section.BatchId, SectionId = section.Id, TeacherId = body.TeacherId.Value,
            AcademicYear = year!, IsActive = body.IsActive ?? true,
        };
        if (offering.IsActive && await DuplicateAsync(db, offering, ct))
        {
            return SetupScope.Exists(http, "This section already takes this course.");
        }

        db.CourseOfferings.Add(offering);
        await db.SaveChangesAsync(ct);
        return ApiResponse.Ok(http, "Offering added", await OneAsync(db, offering.Id, ct), StatusCodes.Status201Created);
    }

    private static async Task<IResult> UpdateAsync(Guid id, OfferingBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var offering = await InDepartment(db, departmentId, tracking: true).FirstOrDefaultAsync(o => o.Id == id, ct);
        if (offering is null)
        {
            return SetupScope.NotFound(http, "Offering");
        }

        var errors = new Dictionary<string, string>();
        var year = SetupScope.Clean(body.AcademicYear);
        SetupScope.RequiredIfSent(errors, "academicYear", year, 20, "Enter the academic year, like 2026 or 2026-27.");
        if ((body.CourseId is { } c && c != offering.CourseId) || (body.SectionId is { } s && s != offering.SectionId))
        {
            errors["courseId"] = "To change the course or section, add a new offering and deactivate this one.";
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        if (body.TeacherId is { } teacherId && teacherId != offering.TeacherId)
        {
            if (await TeacherProblemAsync(http, db, departmentId, teacherId, ct) is { } problem)
            {
                return problem;
            }

            offering.TeacherId = teacherId;
        }

        offering.AcademicYear = year ?? offering.AcademicYear;
        offering.IsActive = body.IsActive ?? offering.IsActive;
        if (offering.IsActive && await DuplicateAsync(db, offering, ct))
        {
            return SetupScope.Exists(http, "This section already takes this course.");
        }

        await db.SaveChangesAsync(ct);
        return ApiResponse.Ok(http, "Saved", await OneAsync(db, id, ct));
    }

    private static async Task<IResult> DeleteAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        if (!await InDepartment(db, SetupScope.DepartmentId(http)).AnyAsync(o => o.Id == id, ct))
        {
            return SetupScope.NotFound(http, "Offering");
        }

        if (await db.Routines.AnyAsync(r => r.CourseOfferingId == id, ct))
        {
            return SetupScope.InUse(http, "This offering has classes in the routine. Remove them first, or deactivate the offering.");
        }

        await db.CourseOfferings.Where(o => o.Id == id).ExecuteDeleteAsync(ct);
        return ApiResponse.Ok(http, "Offering deleted", new DeletedResult(id));
    }

    // ---------------------------------------------------------------- helpers

    /// <summary>Offerings whose batch is in the department.</summary>
    internal static IQueryable<CourseOffering> InDepartment(UniSyncDbContext db, Guid departmentId, bool tracking = false) =>
        from o in tracking ? db.CourseOfferings : db.CourseOfferings.AsNoTracking()
        join b in db.Batches on o.BatchId equals b.Id
        where b.DepartmentId == departmentId
        select o;

    /// <summary>The teacher must teach in this department and be able to sign in.</summary>
    private static async Task<IResult?> TeacherProblemAsync(HttpContext http, UniSyncDbContext db, Guid departmentId, Guid teacherId, CancellationToken ct)
    {
        var teacher = await (
            from t in db.TeacherProfiles
            join a in db.Accounts on t.UserId equals a.Id
            where t.UserId == teacherId && t.DepartmentId == departmentId && a.Role == "teacher" && a.DeletedAt == null
            select new { a.IsActive }).FirstOrDefaultAsync(ct);
        if (teacher is null)
        {
            return SetupScope.NotFound(http, "Teacher");
        }

        return teacher.IsActive
            ? null
            : ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "This teacher is inactive. Reactivate them first.");
    }

    private static Task<bool> DuplicateAsync(UniSyncDbContext db, CourseOffering o, CancellationToken ct) =>
        db.CourseOfferings.AnyAsync(x => x.Id != o.Id && x.IsActive && x.CourseId == o.CourseId && x.SectionId == o.SectionId, ct);

    private static Task<OfferingView> OneAsync(UniSyncDbContext db, Guid id, CancellationToken ct) =>
        Project(db, db.CourseOfferings.Where(o => o.Id == id)).FirstAsync(ct);

    private static IQueryable<OfferingView> Project(UniSyncDbContext db, IQueryable<CourseOffering> offerings) =>
        from o in offerings.AsNoTracking()
        join c in db.Courses on o.CourseId equals c.Id
        join b in db.Batches on o.BatchId equals b.Id
        join s in db.Sections on o.SectionId equals s.Id
        select new OfferingView(
            o.Id, new CourseRef(c.Id, c.Code, c.Name), new Ref(b.Id, b.Name), new Ref(s.Id, s.Name),
            new Ref(o.TeacherId, db.TeacherProfiles.Where(t => t.UserId == o.TeacherId)
                .Select(t => ((t.FirstName ?? "") + " " + (t.LastName ?? "")).Trim()).FirstOrDefault() ?? ""),
            o.AcademicYear, o.IsActive, db.Routines.Count(r => r.CourseOfferingId == o.Id && r.IsActive));
}
