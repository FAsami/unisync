using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record StudentView(
    Guid Id, string Phone, string FirstName, string LastName, string? StudentId,
    Ref? Batch, Ref? Section, bool IsActive, bool IsClassRepresentative);

public sealed record StudentBody(
    string? Phone, string? FirstName, string? LastName, string? StudentId, Guid? SectionId, bool? IsActive);

/// <summary>One roster line. The section is given by id, or by batch and section name (as in a spreadsheet).</summary>
public sealed record StudentImportRow(
    string? Phone, string? FirstName, string? LastName, string? StudentId, Guid? SectionId, string? Batch, string? Section);

public sealed record StudentImportBody(List<StudentImportRow>? Rows, bool? DryRun);

/// <summary>Outcome per row: created | updated | unchanged | error (with field errors).</summary>
public sealed record StudentImportRowResult(int Row, string? Phone, string Outcome, Dictionary<string, string>? Errors);

/// <summary>
/// The import result. When any row has errors the response is 400 VALIDATION_FAILED,
/// nothing is written, and this same shape is in <c>error.details</c>.
/// </summary>
public sealed record StudentImportResult(
    int Total, int Created, int Updated, int Unchanged, int Failed, bool DryRun, IReadOnlyList<StudentImportRowResult> Rows);

/// <summary>
/// The department roster (UX review decision 1): students are added by their
/// department, then sign in with their number. A student is an account (role
/// student, no password) plus a profile placing them in a section. CR is a mark
/// on a student for their own section, not a role.
/// </summary>
public static partial class StudentEndpoints
{
    public const int MaxImportRows = 2000;
    private const int MaxList = 2000;

    public static RouteGroupBuilder MapStudentSetupEndpoints(this RouteGroupBuilder api)
    {
        var students = api.MapDepartmentAdminGroup("/students", "Setup: students");
        students.MapGet("/", ListAsync).Returns<List<StudentView>>();
        students.MapPost("/", CreateAsync).Returns<StudentView>(StatusCodes.Status201Created);
        students.MapPost("/import", ImportAsync).Returns<StudentImportResult>();
        students.MapPatch("/{id:guid}", UpdateAsync).Returns<StudentView>();
        students.MapPut("/{id:guid}/class-representative", MarkCrAsync).Returns<StudentView>();
        students.MapDelete("/{id:guid}/class-representative", UnmarkCrAsync).Returns<StudentView>();
        return api;
    }

    // ---------------------------------------------------------------- list / one

    private static async Task<IResult> ListAsync(
        HttpContext http, UniSyncDbContext db, Guid? batchId, Guid? sectionId, bool? active, string? q, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var query = Roster(db, departmentId);
        if (batchId is { } b)
        {
            query = query.Where(x => x.Profile.BatchId == b);
        }

        if (sectionId is { } s)
        {
            query = query.Where(x => x.Profile.SectionId == s);
        }

        if (active is { } a)
        {
            query = query.Where(x => x.Account.IsActive == a);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var like = SetupScope.ContainsPattern(q);
            query = query.Where(x => EF.Functions.ILike(x.Profile.FirstName, like) || EF.Functions.ILike(x.Profile.LastName, like)
                || EF.Functions.ILike(x.Account.Phone, like) || (x.Profile.StudentId != null && EF.Functions.ILike(x.Profile.StudentId, like)));
        }

        var rows = await Project(db, query.OrderBy(x => x.Profile.StudentId).ThenBy(x => x.Profile.FirstName)).Take(MaxList).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", rows);
    }

    // ---------------------------------------------------------------- create / update

    private static async Task<IResult> CreateAsync(
        StudentBody body, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, TimeProvider time, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var errors = new Dictionary<string, string>();
        if (!PhoneNumber.TryNormalize(body.Phone, out var phone))
        {
            errors["phone"] = InvalidPhone;
        }

        var first = SetupScope.Clean(body.FirstName);
        var last = SetupScope.Clean(body.LastName);
        var studentId = SetupScope.Clean(body.StudentId);
        SetupScope.Required(errors, "firstName", first, 100, "Enter the student's first name.");
        SetupScope.Required(errors, "lastName", last, 100, "Enter the student's last name.");
        if (studentId is null || !StudentIdPattern().IsMatch(studentId))
        {
            errors["studentId"] = InvalidStudentId;
        }

        if (body.SectionId is null)
        {
            errors["sectionId"] = "Choose the section.";
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        var placement = await PlacementAsync(db, departmentId, body.SectionId!.Value, ct);
        if (placement is null)
        {
            return SetupScope.NotFound(http, "Section");
        }

        if (await db.Accounts.AnyAsync(a => a.Phone == phone, ct))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number already has an account.");
        }

        if (await db.Profiles.AnyAsync(p => p.StudentId == studentId, ct))
        {
            return StudentIdTaken(http);
        }

        var account = new Account { Id = Guid.NewGuid(), Phone = phone, Role = "student", IsActive = body.IsActive ?? true };
        db.Accounts.Add(account);
        db.Profiles.Add(new Profile
        {
            UserId = account.Id, FirstName = first!, LastName = last!, StudentId = studentId,
            DepartmentId = departmentId, BatchId = placement.BatchId, SectionId = placement.SectionId,
        });

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "account_phone_key"))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number already has an account.");
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "profile_student_id_key"))
        {
            return StudentIdTaken(http);
        }

        await SettlePendingRequestsAsync(db, [(phone, account.Id)], departmentId, SetupScope.UserId(user), time.GetUtcNow(), ct);
        await transaction.CommitAsync(ct);
        return ApiResponse.Ok(http, "Student added. They can sign in with this number.", await OneAsync(db, departmentId, account.Id, ct),
            StatusCodes.Status201Created);
    }

    private static async Task<IResult> UpdateAsync(Guid id, StudentBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var found = await Roster(db, departmentId, tracking: true).FirstOrDefaultAsync(x => x.Account.Id == id, ct);
        if (found is null)
        {
            return StudentNotFound(http);
        }

        var (account, profile) = (found.Account, found.Profile);
        var errors = new Dictionary<string, string>();
        string? phone = null;
        if (body.Phone is not null && !PhoneNumber.TryNormalize(body.Phone, out phone))
        {
            errors["phone"] = InvalidPhone;
        }

        var first = SetupScope.Clean(body.FirstName);
        var last = SetupScope.Clean(body.LastName);
        var studentId = SetupScope.Clean(body.StudentId);
        SetupScope.RequiredIfSent(errors, "firstName", first, 100, "Enter the student's first name.");
        SetupScope.RequiredIfSent(errors, "lastName", last, 100, "Enter the student's last name.");
        if (studentId is not null && !StudentIdPattern().IsMatch(studentId))
        {
            errors["studentId"] = InvalidStudentId;
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        Placement? placement = null;
        if (body.SectionId is { } sectionId && sectionId != profile.SectionId)
        {
            placement = await PlacementAsync(db, departmentId, sectionId, ct);
            if (placement is null)
            {
                return SetupScope.NotFound(http, "Section");
            }
        }

        var oldSection = profile.SectionId;
        profile.FirstName = first ?? profile.FirstName;
        profile.LastName = last ?? profile.LastName;
        profile.StudentId = studentId ?? profile.StudentId;
        if (placement is not null)
        {
            profile.BatchId = placement.BatchId;
            profile.SectionId = placement.SectionId;
        }

        account.Phone = phone ?? account.Phone;
        var deactivating = body.IsActive == false && account.IsActive;
        account.IsActive = body.IsActive ?? account.IsActive;

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "account_phone_key"))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "Another account already uses that number.");
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "profile_student_id_key"))
        {
            return StudentIdTaken(http);
        }

        if (placement is not null && oldSection is { } previous)
        {
            await EndCrAsync(db, id, previous, ct); // a CR represents their own section only
        }

        if (deactivating || phone is not null)
        {
            await PeopleHelpers.SignOutEverywhereAsync(db, id, ct);
        }

        await transaction.CommitAsync(ct);
        return ApiResponse.Ok(http, "Saved", await OneAsync(db, departmentId, id, ct));
    }

    // ---------------------------------------------------------------- CR mark

    private static async Task<IResult> MarkCrAsync(Guid id, HttpContext http, UniSyncDbContext db, CampusClock clock, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var found = await Roster(db, departmentId).FirstOrDefaultAsync(x => x.Account.Id == id, ct);
        if (found is null)
        {
            return StudentNotFound(http);
        }

        if (!found.Account.IsActive || found.Profile.SectionId is null || found.Profile.BatchId is null)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Only an active student with a section can be a CR.");
        }

        var sectionId = found.Profile.SectionId.Value;
        var batchId = found.Profile.BatchId.Value;
        var today = clock.Today;
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO academic.class_representative (user_id, section_id, batch_id, appointed_at, is_active)
            VALUES ({id}, {sectionId}, {batchId}, {today}, true)
            ON CONFLICT (user_id, section_id) DO UPDATE SET is_active = true, batch_id = EXCLUDED.batch_id,
                appointed_at = CASE WHEN academic.class_representative.is_active THEN academic.class_representative.appointed_at
                                    ELSE EXCLUDED.appointed_at END
            """, ct);
        return ApiResponse.Ok(http, "Marked as CR", await OneAsync(db, departmentId, id, ct));
    }

    private static async Task<IResult> UnmarkCrAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        if (!await Roster(db, departmentId).AnyAsync(x => x.Account.Id == id, ct))
        {
            return StudentNotFound(http);
        }

        await db.ClassRepresentatives.Where(c => c.UserId == id && c.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.IsActive, false), ct);
        return ApiResponse.Ok(http, "No longer a CR", await OneAsync(db, departmentId, id, ct));
    }

    private static Task<int> EndCrAsync(UniSyncDbContext db, Guid userId, Guid sectionId, CancellationToken ct) =>
        db.ClassRepresentatives.Where(c => c.UserId == userId && c.SectionId == sectionId && c.IsActive)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.IsActive, false), ct);

    // ---------------------------------------------------------------- import

    private sealed record Planned(int Row, string Phone, string First, string Last, string StudentId, Placement Placement, Account? Existing, Profile? Profile);

    private static async Task<IResult> ImportAsync(
        StudentImportBody body, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, TimeProvider time, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var rows = body.Rows ?? [];
        if (rows.Count == 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Add at least one student to import.");
        }

        if (rows.Count > MaxImportRows)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, $"Import at most {MaxImportRows} students at a time.");
        }

        var dryRun = body.DryRun ?? false;

        // Everything the rows refer to, loaded once.
        var sections = await (
            from s in db.Sections
            join b in db.Batches on s.BatchId equals b.Id
            where b.DepartmentId == departmentId
            select new { SectionId = s.Id, BatchId = b.Id, SectionName = s.Name, BatchName = b.Name, Open = s.IsActive && b.IsActive })
            .AsNoTracking().ToListAsync(ct);

        var phones = new List<string>();
        foreach (var row in rows)
        {
            if (PhoneNumber.TryNormalize(row.Phone, out var p))
            {
                phones.Add(p);
            }
        }

        var accounts = await db.Accounts.Where(a => phones.Contains(a.Phone)).ToDictionaryAsync(a => a.Phone, ct);
        var accountIds = accounts.Values.Select(a => a.Id).ToList();
        var profiles = await db.Profiles.Where(p => accountIds.Contains(p.UserId)).ToDictionaryAsync(p => p.UserId, ct);
        var studentIds = rows.Select(r => SetupScope.Clean(r.StudentId)).OfType<string>().ToList();
        var studentIdOwners = await db.Profiles.AsNoTracking()
            .Where(p => p.StudentId != null && studentIds.Contains(p.StudentId))
            .ToDictionaryAsync(p => p.StudentId!, p => p.UserId, ct);

        var results = new List<StudentImportRowResult>();
        var plan = new List<Planned>();
        var seenPhones = new Dictionary<string, int>();
        var seenStudentIds = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var number = i + 1;
            var errors = new Dictionary<string, string>();

            var phoneOk = PhoneNumber.TryNormalize(row.Phone, out var phone);
            if (!phoneOk)
            {
                errors["phone"] = InvalidPhone;
            }
            else if (seenPhones.TryGetValue(phone, out var firstRow))
            {
                errors["phone"] = $"Same number as row {firstRow}.";
            }
            else
            {
                seenPhones[phone] = number;
            }

            var first = SetupScope.Clean(row.FirstName);
            var last = SetupScope.Clean(row.LastName);
            var studentId = SetupScope.Clean(row.StudentId);
            SetupScope.Required(errors, "firstName", first, 100, "First name is missing.");
            SetupScope.Required(errors, "lastName", last, 100, "Last name is missing.");
            if (studentId is null || !StudentIdPattern().IsMatch(studentId))
            {
                errors["studentId"] = InvalidStudentId;
            }
            else if (seenStudentIds.TryGetValue(studentId, out var firstRow))
            {
                errors["studentId"] = $"Same student ID as row {firstRow}.";
            }
            else
            {
                seenStudentIds[studentId] = number;
            }

            // Section: by id, or by batch + section name.
            var section = row.SectionId is { } sid
                ? sections.FirstOrDefault(s => s.SectionId == sid)
                : sections.FirstOrDefault(s =>
                    string.Equals(s.BatchName, row.Batch?.Trim(), StringComparison.OrdinalIgnoreCase)
                    && string.Equals(s.SectionName, row.Section?.Trim(), StringComparison.OrdinalIgnoreCase));
            if (section is null)
            {
                errors["section"] = row.SectionId is null && (string.IsNullOrWhiteSpace(row.Batch) || string.IsNullOrWhiteSpace(row.Section))
                    ? "Give the batch and section."
                    : "No such section in your department.";
            }
            else if (!section.Open)
            {
                errors["section"] = $"Section {section.BatchName} {section.SectionName} is inactive.";
            }

            Account? existing = null;
            Profile? profile = null;
            if (phoneOk && accounts.TryGetValue(phone, out existing))
            {
                profiles.TryGetValue(existing.Id, out profile);
                // One message for every reason this number can't become a student here:
                // which reason it is would tell an admin about another department's roster,
                // or about a role (teacher, admin) this screen has no business naming.
                const string notAvailable = "This number already has an account.";
                if (existing.DeletedAt is not null)
                {
                    errors["phone"] = notAvailable;
                }
                else if (existing.Role is not ("student" or "class_representative"))
                {
                    errors["phone"] = notAvailable;
                }
                else if (profile is null || profile.DepartmentId != departmentId)
                {
                    errors["phone"] = notAvailable;
                }
            }

            if (studentId is not null && studentIdOwners.TryGetValue(studentId, out var owner) && owner != existing?.Id)
            {
                errors["studentId"] = "This student ID belongs to someone else.";
            }

            if (errors.Count > 0)
            {
                results.Add(new StudentImportRowResult(number, phoneOk ? phone : row.Phone, "error", errors));
                continue;
            }

            var placement = new Placement(section!.BatchId, section.SectionId);
            plan.Add(new Planned(number, phone, first!, last!, studentId!, placement, existing, profile));
            var outcome = existing is null ? "created"
                : existing.IsActive && profile!.FirstName == first && profile.LastName == last && profile.StudentId == studentId
                  && profile.SectionId == placement.SectionId && profile.BatchId == placement.BatchId
                    ? "unchanged" : "updated";
            results.Add(new StudentImportRowResult(number, phone, outcome, null));
        }

        var summary = new StudentImportResult(
            rows.Count,
            results.Count(r => r.Outcome == "created"),
            results.Count(r => r.Outcome == "updated"),
            results.Count(r => r.Outcome == "unchanged"),
            results.Count(r => r.Outcome == "error"),
            dryRun,
            results);

        if (summary.Failed > 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed,
                $"{summary.Failed} of {rows.Count} rows need fixing. Nothing was imported.", summary);
        }

        if (dryRun)
        {
            return ApiResponse.Ok(http, "Checked. Nothing was imported yet.", summary);
        }

        // Apply: re-running the same file changes nothing (idempotent on phone).
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var created = new List<(string Phone, Guid Id)>();
        foreach (var p in plan)
        {
            if (p.Existing is null)
            {
                var account = new Account { Id = Guid.NewGuid(), Phone = p.Phone, Role = "student", IsActive = true };
                db.Accounts.Add(account);
                db.Profiles.Add(new Profile
                {
                    UserId = account.Id, FirstName = p.First, LastName = p.Last, StudentId = p.StudentId,
                    DepartmentId = departmentId, BatchId = p.Placement.BatchId, SectionId = p.Placement.SectionId,
                });
                created.Add((p.Phone, account.Id));
                continue;
            }

            var profile = p.Profile!;
            if (profile.SectionId is { } previous && previous != p.Placement.SectionId)
            {
                await EndCrAsync(db, p.Existing.Id, previous, ct);
            }

            profile.FirstName = p.First;
            profile.LastName = p.Last;
            profile.StudentId = p.StudentId;
            profile.BatchId = p.Placement.BatchId;
            profile.SectionId = p.Placement.SectionId;
            p.Existing.IsActive = true; // on the roster again
        }

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyExists,
                "Someone changed the roster while importing (a number or student ID is now taken). Check the file and try again.");
        }

        await SettlePendingRequestsAsync(db, created, departmentId, SetupScope.UserId(user), time.GetUtcNow(), ct);
        await transaction.CommitAsync(ct);
        return ApiResponse.Ok(http, $"Imported {summary.Created} new and updated {summary.Updated} students.", summary);
    }

    // ---------------------------------------------------------------- helpers

    private sealed record Placement(Guid BatchId, Guid SectionId);

    /// <summary>Member-init rows, so callers can filter before projecting (EF can't see through record constructors).</summary>
    private sealed class RosterRow
    {
        public required Account Account { get; init; }
        public required Profile Profile { get; init; }
    }

    /// <summary>Non-deleted students whose profile is in the department.</summary>
    private static IQueryable<RosterRow> Roster(UniSyncDbContext db, Guid departmentId, bool tracking = false)
    {
        var accounts = tracking ? db.Accounts : db.Accounts.AsNoTracking();
        var profiles = tracking ? db.Profiles : db.Profiles.AsNoTracking();
        return from a in accounts
               join p in profiles on a.Id equals p.UserId
               where p.DepartmentId == departmentId && a.DeletedAt == null && (a.Role == "student" || a.Role == "class_representative")
               select new RosterRow { Account = a, Profile = p };
    }

    private static IQueryable<StudentView> Project(UniSyncDbContext db, IQueryable<RosterRow> rows) =>
        from x in rows
        join b in db.Batches on x.Profile.BatchId equals (Guid?)b.Id into batches
        from b in batches.DefaultIfEmpty()
        join s in db.Sections on x.Profile.SectionId equals (Guid?)s.Id into sections
        from s in sections.DefaultIfEmpty()
        select new StudentView(
            x.Account.Id, x.Account.Phone, x.Profile.FirstName, x.Profile.LastName, x.Profile.StudentId,
            b == null ? null : new Ref(b.Id, b.Name),
            s == null ? null : new Ref(s.Id, s.Name),
            x.Account.IsActive,
            db.ClassRepresentatives.Any(c => c.UserId == x.Account.Id && c.SectionId == x.Profile.SectionId && c.IsActive));

    private static Task<StudentView> OneAsync(UniSyncDbContext db, Guid departmentId, Guid id, CancellationToken ct) =>
        Project(db, Roster(db, departmentId).Where(x => x.Account.Id == id)).FirstAsync(ct);

    private static Task<Placement?> PlacementAsync(UniSyncDbContext db, Guid departmentId, Guid sectionId, CancellationToken ct) =>
        (from s in db.Sections
         join b in db.Batches on s.BatchId equals b.Id
         where s.Id == sectionId && b.DepartmentId == departmentId
         select new Placement(b.Id, s.Id)).FirstOrDefaultAsync(ct);

    /// <summary>A student added by the department no longer needs their pending request to join.</summary>
    private static async Task SettlePendingRequestsAsync(
        UniSyncDbContext db, List<(string Phone, Guid Id)> added, Guid departmentId, Guid adminId, DateTimeOffset now, CancellationToken ct)
    {
        foreach (var (phone, accountId) in added)
        {
            await db.AccessRequests
                .Where(r => r.Phone == phone && r.DepartmentId == departmentId && r.Status == AccessRequestStatus.Pending)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(r => r.Status, AccessRequestStatus.Approved)
                    .SetProperty(r => r.DecidedBy, adminId)
                    .SetProperty(r => r.DecidedAt, now)
                    .SetProperty(r => r.AccountId, accountId), ct);
        }
    }

    private const string InvalidPhone = "Enter a Bangladeshi mobile number, like 01712345678.";
    private const string InvalidStudentId = "Enter the student ID (letters, numbers and dashes).";

    private static IResult StudentNotFound(HttpContext http) => SetupScope.NotFound(http, "Student");

    private static IResult StudentIdTaken(HttpContext http) =>
        ApiResponse.Fail(http, 409, ErrorCodes.StudentIdTaken, "That student ID is already registered.");

    [GeneratedRegex("^[A-Za-z0-9-]{1,32}$")]
    private static partial Regex StudentIdPattern();
}
