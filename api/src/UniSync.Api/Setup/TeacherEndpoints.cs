using Microsoft.EntityFrameworkCore;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record TeacherView(
    Guid Id, string Phone, string FirstName, string LastName, string Designation, string Role, bool IsActive, int OfferingCount);

public sealed record TeacherBody(string? Phone, string? FirstName, string? LastName, string? Designation, bool? IsActive);

/// <summary>
/// Teachers of the department: an account (role teacher, passwordless, signs in
/// by code) plus a <c>user.faculty</c> row tying them to the department. The id
/// is the account id, which offerings use as <c>teacher_id</c>.
/// </summary>
public static class TeacherEndpoints
{
    public const string DefaultDesignation = "Lecturer";

    public static RouteGroupBuilder MapTeacherSetupEndpoints(this RouteGroupBuilder api)
    {
        var teachers = api.MapDepartmentAdminGroup("/teachers", "Setup: teachers");
        teachers.MapGet("/", ListAsync).Returns<List<TeacherView>>();
        teachers.MapPost("/", CreateAsync).Returns<TeacherView>(StatusCodes.Status201Created);
        teachers.MapPatch("/{id:guid}", UpdateAsync).Returns<TeacherView>();
        return api;
    }

    private static async Task<IResult> ListAsync(HttpContext http, UniSyncDbContext db, bool? active, string? q, CancellationToken ct)
    {
        var query = Rows(db, SetupScope.DepartmentId(http));
        if (active is { } a)
        {
            query = query.Where(x => x.Account.IsActive == a);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var like = SetupScope.ContainsPattern(q);
            query = query.Where(x => EF.Functions.ILike(x.Teacher.FirstName ?? "", like) || EF.Functions.ILike(x.Teacher.LastName ?? "", like)
                || EF.Functions.ILike(x.Account.Phone, like));
        }

        var rows = await Project(db, query.OrderBy(x => x.Teacher.FirstName).ThenBy(x => x.Teacher.LastName)).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", rows);
    }

    private static async Task<IResult> CreateAsync(TeacherBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var errors = new Dictionary<string, string>();
        var phone = "";
        if (!PhoneNumber.TryNormalize(body.Phone, out phone))
        {
            errors["phone"] = "Enter a Bangladeshi mobile number, like 01712345678.";
        }

        var first = SetupScope.Clean(body.FirstName);
        var last = SetupScope.Clean(body.LastName);
        var designation = SetupScope.Optional(body.Designation) ?? DefaultDesignation;
        SetupScope.Required(errors, "firstName", first, 100, "Enter the teacher's first name.");
        SetupScope.Required(errors, "lastName", last, 100, "Enter the teacher's last name.");
        if (designation.Length > 100)
        {
            errors["designation"] = "Keep the designation under 100 characters.";
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        var existing = await db.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Phone == phone, ct);
        if (existing is not null)
        {
            return await db.TeacherProfiles.AnyAsync(t => t.UserId == existing.Id && t.DepartmentId == departmentId, ct)
                ? SetupScope.Exists(http, "This number is already one of your teachers.")
                : ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number already has an account. Contact support to change its role.");
        }

        var account = new Account { Id = Guid.NewGuid(), Phone = phone, Role = "teacher", IsActive = body.IsActive ?? true };
        db.Accounts.Add(account);
        db.Profiles.Add(new Profile { UserId = account.Id, FirstName = first!, LastName = last!, DepartmentId = departmentId });
        db.TeacherProfiles.Add(new TeacherProfile
        {
            UserId = account.Id, FirstName = first, LastName = last, Designation = designation, DepartmentId = departmentId,
        });
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "account_phone_key"))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number already has an account.");
        }

        var view = await OneAsync(db, departmentId, account.Id, ct);
        return ApiResponse.Ok(http, "Teacher added. They can sign in with this number.", view, StatusCodes.Status201Created);
    }

    private static async Task<IResult> UpdateAsync(Guid id, TeacherBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var teacher = await db.TeacherProfiles.FirstOrDefaultAsync(t => t.UserId == id && t.DepartmentId == departmentId, ct);
        // Role check: a faculty row alone isn't enough. An account promoted to admin keeps its old
        // faculty row, and editing its phone here would hand that admin account to someone else.
        var account = teacher is null ? null : await db.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.Role == "teacher" && a.DeletedAt == null, ct);
        if (teacher is null || account is null)
        {
            return SetupScope.NotFound(http, "Teacher");
        }

        var errors = new Dictionary<string, string>();
        string? phone = null;
        if (body.Phone is not null && !PhoneNumber.TryNormalize(body.Phone, out phone))
        {
            errors["phone"] = "Enter a Bangladeshi mobile number, like 01712345678.";
        }

        var first = SetupScope.Clean(body.FirstName);
        var last = SetupScope.Clean(body.LastName);
        var designation = SetupScope.Clean(body.Designation);
        SetupScope.RequiredIfSent(errors, "firstName", first, 100, "Enter the teacher's first name.");
        SetupScope.RequiredIfSent(errors, "lastName", last, 100, "Enter the teacher's last name.");
        SetupScope.RequiredIfSent(errors, "designation", designation, 100, "Enter the designation, like Lecturer.");
        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        teacher.FirstName = first ?? teacher.FirstName;
        teacher.LastName = last ?? teacher.LastName;
        teacher.Designation = designation ?? teacher.Designation;
        account.Phone = phone ?? account.Phone;
        var deactivating = body.IsActive == false && account.IsActive;
        account.IsActive = body.IsActive ?? account.IsActive;

        // Keep the profile (names shown by /me and notifications) in step.
        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == id, ct);
        if (profile is null)
        {
            db.Profiles.Add(new Profile
            {
                UserId = id, FirstName = teacher.FirstName ?? "", LastName = teacher.LastName ?? "", DepartmentId = departmentId,
            });
        }
        else
        {
            profile.FirstName = teacher.FirstName ?? profile.FirstName;
            profile.LastName = teacher.LastName ?? profile.LastName;
        }

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "account_phone_key"))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "Another account already uses that number.");
        }

        if (deactivating || phone is not null)
        {
            await PeopleHelpers.SignOutEverywhereAsync(db, id, ct);
        }

        await transaction.CommitAsync(ct);
        return ApiResponse.Ok(http, "Saved", await OneAsync(db, departmentId, id, ct));
    }

    /// <summary>Member-init rows, so callers can filter before projecting (EF can't see through record constructors).</summary>
    private sealed class TeacherRow
    {
        public required TeacherProfile Teacher { get; init; }
        public required Account Account { get; init; }
    }

    private static IQueryable<TeacherRow> Rows(UniSyncDbContext db, Guid departmentId) =>
        from t in db.TeacherProfiles.AsNoTracking()
        join a in db.Accounts.AsNoTracking() on t.UserId equals a.Id
        where t.DepartmentId == departmentId && a.Role == "teacher" && a.DeletedAt == null
        select new TeacherRow { Teacher = t, Account = a };

    private static IQueryable<TeacherView> Project(UniSyncDbContext db, IQueryable<TeacherRow> rows) =>
        from x in rows
        select new TeacherView(
            x.Account.Id, x.Account.Phone, x.Teacher.FirstName ?? "", x.Teacher.LastName ?? "", x.Teacher.Designation, x.Account.Role,
            x.Account.IsActive, db.CourseOfferings.Count(o => o.TeacherId == x.Account.Id && o.IsActive));

    private static Task<TeacherView> OneAsync(UniSyncDbContext db, Guid departmentId, Guid id, CancellationToken ct) =>
        Project(db, Rows(db, departmentId).Where(x => x.Account.Id == id)).FirstAsync(ct);
}

internal static class PeopleHelpers
{
    /// <summary>
    /// Revokes every session and turns off every device, so a deactivated person (or a changed
    /// number) must sign in again, and the old handset stops receiving their pushes.
    /// </summary>
    public static async Task SignOutEverywhereAsync(UniSyncDbContext db, Guid userId, CancellationToken ct)
    {
        await db.Sessions.Where(s => s.UserId == userId && !s.Revoked).ExecuteUpdateAsync(s => s.SetProperty(x => x.Revoked, true), ct);
        await db.Devices.Where(d => d.UserId == userId && d.IsActive).ExecuteUpdateAsync(d => d.SetProperty(x => x.IsActive, false), ct);
    }
}
