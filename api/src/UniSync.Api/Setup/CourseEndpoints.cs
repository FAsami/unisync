using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record CourseView(
    Guid Id, string Code, string Name, string? Description, decimal CreditHours, int Semester, string CourseType, bool IsActive);

public sealed record CourseBody(
    string? Code, string? Name, string? Description, decimal? CreditHours, int? Semester, string? CourseType, bool? IsActive);

/// <summary>The department's course catalogue. A course is taught to a section through an offering.</summary>
public static partial class CourseEndpoints
{
    public static readonly string[] CourseTypes = ["THEORY", "LAB"];

    public static RouteGroupBuilder MapCourseSetupEndpoints(this RouteGroupBuilder api)
    {
        var courses = api.MapDepartmentAdminGroup("/courses", "Setup: courses");
        courses.MapGet("/", ListAsync).Returns<List<CourseView>>();
        courses.MapPost("/", CreateAsync).Returns<CourseView>(StatusCodes.Status201Created);
        courses.MapPatch("/{id:guid}", UpdateAsync).Returns<CourseView>();
        courses.MapDelete("/{id:guid}", DeleteAsync).Returns<DeletedResult>();
        return api;
    }

    private static async Task<IResult> ListAsync(HttpContext http, UniSyncDbContext db, int? semester, bool? active, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var query = db.Courses.AsNoTracking().Where(c => c.DepartmentId == departmentId);
        if (semester is { } s)
        {
            query = query.Where(c => c.Semester == s);
        }

        if (active is { } a)
        {
            query = query.Where(c => c.IsActive == a);
        }

        var rows = await query.OrderBy(c => c.Semester).ThenBy(c => c.Code).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", rows.Select(View).ToList());
    }

    private static async Task<IResult> CreateAsync(CourseBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var course = new Course { DepartmentId = SetupScope.DepartmentId(http), IsActive = body.IsActive ?? true };
        if (Apply(course, body, creating: true) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        db.Courses.Add(course);
        return await SaveAsync(http, db, course, "Course added", StatusCodes.Status201Created, ct);
    }

    private static async Task<IResult> UpdateAsync(Guid id, CourseBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == id && c.DepartmentId == departmentId, ct);
        if (course is null)
        {
            return SetupScope.NotFound(http, "Course");
        }

        if (Apply(course, body, creating: false) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        course.IsActive = body.IsActive ?? course.IsActive;
        return await SaveAsync(http, db, course, "Saved", StatusCodes.Status200OK, ct);
    }

    private static async Task<IResult> DeleteAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        if (!await db.Courses.AnyAsync(c => c.Id == id && c.DepartmentId == departmentId, ct))
        {
            return SetupScope.NotFound(http, "Course");
        }

        if (await db.CourseOfferings.AnyAsync(o => o.CourseId == id, ct))
        {
            return SetupScope.InUse(http, "This course is offered to a section. Mark it inactive instead.");
        }

        await db.Courses.Where(c => c.Id == id).ExecuteDeleteAsync(ct);
        return ApiResponse.Ok(http, "Course deleted", new DeletedResult(id));
    }

    private static async Task<IResult> SaveAsync(HttpContext http, UniSyncDbContext db, Course course, string message, int status, CancellationToken ct)
    {
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "course_department_id_code_key"))
        {
            return SetupScope.Exists(http, $"There's already a course {course.Code}.");
        }

        return ApiResponse.Ok(http, message, View(course), status);
    }

    private static Dictionary<string, string> Apply(Course course, CourseBody body, bool creating)
    {
        var errors = new Dictionary<string, string>();
        var code = SetupScope.Clean(body.Code)?.ToUpperInvariant();
        var name = SetupScope.Clean(body.Name);
        var type = SetupScope.Clean(body.CourseType)?.ToUpperInvariant();

        if (creating || code is not null)
        {
            if (code is null || !CodePattern().IsMatch(code))
            {
                errors["code"] = "Enter the course code, like CSE-101 (letters, numbers, spaces and dashes).";
            }
        }

        if (creating)
        {
            SetupScope.Required(errors, "name", name, 200, "Enter the course name.");
            if (body.CreditHours is null)
            {
                errors["creditHours"] = "Enter the credit hours.";
            }

            if (body.Semester is null)
            {
                errors["semester"] = "Enter the semester this course is taught in.";
            }
        }
        else
        {
            SetupScope.RequiredIfSent(errors, "name", name, 200, "Enter the course name.");
        }

        if (body.CreditHours is < 0 or > 12)
        {
            errors["creditHours"] = "Credit hours must be between 0 and 12.";
        }

        if (body.Semester is < 1 or > 16)
        {
            errors["semester"] = "The semester must be between 1 and 16.";
        }

        if (type is not null && !CourseTypes.Contains(type))
        {
            errors["courseType"] = "Choose THEORY or LAB.";
        }

        if (errors.Count > 0)
        {
            return errors;
        }

        course.Code = code ?? course.Code;
        course.Name = name ?? course.Name;
        course.CreditHours = body.CreditHours ?? course.CreditHours;
        course.Semester = body.Semester ?? course.Semester;
        course.CourseType = type ?? course.CourseType;
        if (body.Description is not null)
        {
            course.Description = SetupScope.Optional(body.Description);
        }

        return errors;
    }

    private static CourseView View(Course c) =>
        new(c.Id, c.Code, c.Name, c.Description, c.CreditHours, c.Semester, c.CourseType, c.IsActive);

    [GeneratedRegex("^[A-Z0-9][A-Z0-9 -]{1,19}$")]
    private static partial Regex CodePattern();
}
