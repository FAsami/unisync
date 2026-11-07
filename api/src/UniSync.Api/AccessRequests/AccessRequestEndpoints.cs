using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Configuration;
using UniSync.Api.Data;
using UniSync.Api.Sms;

namespace UniSync.Api.AccessRequests;

public sealed record AccessCodeBody(string? Phone);

public sealed record SubmitAccessRequestBody(
    string? Phone, string? Code, string? FirstName, string? LastName, string? StudentId, Guid? SectionId);

public sealed record AccessRequestCreated(Guid Id, string Status);

public sealed record NamedRef(Guid Id, string Name);

public sealed record AccessRequestView(
    Guid Id, string Phone, string FirstName, string LastName, string StudentId,
    NamedRef Batch, NamedRef Section, string Status, string? RejectionReason,
    DateTimeOffset CreatedAt, DateTimeOffset? DecidedAt);

public sealed record RejectBody(string? Reason);

/// <summary>
/// Students missing from the roster ask to join; their department approves or
/// rejects (UX review decision 1). Approval creates the account, after which the
/// student signs in through the normal /auth flow.
/// </summary>
public static partial class AccessRequestEndpoints
{
    public const string Purpose = "ACCESS_REQUEST";
    private const int MaxNameLength = 100;
    private const int MaxReasonLength = 500;

    public static RouteGroupBuilder MapAccessRequestEndpoints(this RouteGroupBuilder api)
    {
        var group = api.MapGroup("/access-requests").WithTags("Access requests");

        // Public: the requester has no account yet.
        group.MapPost("/code", RequestCodeAsync).RequireRateLimiting(AuthEndpoints.CodePolicy).Returns<CodeSent>();
        group.MapPost("/", SubmitAsync).RequireRateLimiting(AuthEndpoints.VerifyPolicy).Returns<AccessRequestCreated>(StatusCodes.Status201Created);

        // Department admins only, scoped to their own department.
        group.MapGet("/", ListAsync).RequireAuthorization(Policies.DepartmentAdmin).Returns<List<AccessRequestView>>();
        group.MapPost("/{id:guid}/approve", ApproveAsync).RequireAuthorization(Policies.DepartmentAdmin).Returns<AccessRequestView>();
        group.MapPost("/{id:guid}/reject", RejectAsync).RequireAuthorization(Policies.DepartmentAdmin).Returns<AccessRequestView>();
        return api;
    }

    // ---------------------------------------------------------------- requester

    private static async Task<IResult> RequestCodeAsync(
        AccessCodeBody body, HttpContext http, UniSyncDbContext db, OtpService otp, ISmsSender sms,
        IOptions<OtpOptions> otpOptions, ILoggerFactory loggers, CancellationToken ct)
    {
        if (!PhoneNumber.TryNormalize(body.Phone, out var phone))
        {
            return InvalidPhone(http);
        }

        // Check before texting anything: each of these would make the code useless.
        if (await AlreadyRegisteredAsync(http, db, phone, ct) is { } registered)
        {
            return registered;
        }

        if (await db.AccessRequests.AnyAsync(r => r.Phone == phone && r.Status == AccessRequestStatus.Pending, ct))
        {
            return Pending(http);
        }

        return await AuthEndpoints.SendCodeAsync(http, otp, sms, otpOptions.Value, loggers, phone, Purpose,
            code => $"{code} is your UniSync verification code. It expires in {(int)otpOptions.Value.Lifetime.TotalMinutes} minutes.", ct);
    }

    private static async Task<IResult> SubmitAsync(
        SubmitAccessRequestBody body, HttpContext http, UniSyncDbContext db, OtpService otp,
        IOptions<OtpOptions> otpOptions, CancellationToken ct)
    {
        if (!PhoneNumber.TryNormalize(body.Phone, out var phone))
        {
            return InvalidPhone(http);
        }

        var firstName = body.FirstName?.Trim() ?? "";
        var lastName = body.LastName?.Trim() ?? "";
        var studentId = body.StudentId?.Trim() ?? "";
        var errors = new Dictionary<string, string>();
        if (firstName.Length is 0 or > MaxNameLength)
        {
            errors["firstName"] = "Enter your first name.";
        }

        if (lastName.Length is 0 or > MaxNameLength)
        {
            errors["lastName"] = "Enter your last name.";
        }

        if (!StudentIdPattern().IsMatch(studentId))
        {
            errors["studentId"] = "Enter your student ID (letters, numbers and dashes).";
        }

        if (body.SectionId is null)
        {
            errors["sectionId"] = "Choose your section.";
        }

        var length = otpOptions.Value.Length;
        if (body.Code is null || body.Code.Length != length || !body.Code.All(char.IsAsciiDigit))
        {
            errors["code"] = $"Enter the {length}-digit code from the SMS.";
        }

        if (errors.Count > 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Some fields need fixing.", errors);
        }

        // Department and batch come from the section, so they can't contradict it.
        var placement = await (
            from s in db.Sections
            join b in db.Batches on s.BatchId equals b.Id
            join d in db.Departments on b.DepartmentId equals d.Id
            where s.Id == body.SectionId && s.IsActive && b.IsActive && d.IsActive
            select new { SectionId = s.Id, BatchId = b.Id, DepartmentId = d.Id }).FirstOrDefaultAsync(ct);
        if (placement is null)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.InvalidSection, "That section isn't open for requests. Choose another.");
        }

        if (await AlreadyRegisteredAsync(http, db, phone, ct) is { } registered)
        {
            return registered;
        }

        if (await db.AccessRequests.AnyAsync(r => r.Phone == phone && r.Status == AccessRequestStatus.Pending, ct))
        {
            return Pending(http);
        }

        if (await db.Profiles.AnyAsync(p => p.StudentId == studentId, ct)
            || await db.AccessRequests.AnyAsync(r => r.StudentId == studentId && r.Status == AccessRequestStatus.Pending, ct))
        {
            return StudentIdTaken(http);
        }

        // Last, so a request that would fail anyway doesn't burn the code.
        var check = await otp.CheckAndConsumeAsync(phone, Purpose, body.Code!, ct);
        if (!check.Ok)
        {
            object? details = check.AttemptsRemaining is { } left ? new { attemptsRemaining = left } : null;
            return ApiResponse.Fail(http, 400, check.ErrorCode!, check.Message!, details);
        }

        var request = new AccessRequest
        {
            Phone = phone,
            FirstName = firstName,
            LastName = lastName,
            StudentId = studentId,
            DepartmentId = placement.DepartmentId,
            BatchId = placement.BatchId,
            SectionId = placement.SectionId,
        };
        db.AccessRequests.Add(request);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex, "access_request_one_pending_per_phone"))
        {
            return Pending(http); // a parallel submit won
        }

        return ApiResponse.Ok(http, "Request sent. We'll text you when your department decides.",
            new AccessRequestCreated(request.Id, request.Status), StatusCodes.Status201Created);
    }

    // ---------------------------------------------------------------- department admin

    private static async Task<IResult> ListAsync(
        ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, string? status, CancellationToken ct)
    {
        if (await ManagedDepartmentAsync(user, db, ct) is not { } departmentId)
        {
            return NoDepartment(http);
        }

        status ??= AccessRequestStatus.Pending;
        if (status is not (AccessRequestStatus.Pending or AccessRequestStatus.Approved or AccessRequestStatus.Rejected or "all"))
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "status must be pending, approved, rejected or all.");
        }

        var query = db.AccessRequests.AsNoTracking().Where(r => r.DepartmentId == departmentId);
        if (status != "all")
        {
            query = query.Where(r => r.Status == status);
        }

        // Pending is a queue (oldest first); decided requests read as history (newest first).
        query = status == AccessRequestStatus.Pending
            ? query.OrderBy(r => r.CreatedAt)
            : query.OrderByDescending(r => r.CreatedAt);

        var rows = await Project(query, db).Take(200).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", rows);
    }

    private static async Task<IResult> ApproveAsync(
        Guid id, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, ISmsSender sms,
        TimeProvider time, ILoggerFactory loggers, CancellationToken ct)
    {
        if (await ManagedDepartmentAsync(user, db, ct) is not { } departmentId)
        {
            return NoDepartment(http);
        }

        var adminId = UserId(user);
        var now = time.GetUtcNow();

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var request = await db.AccessRequests.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id && r.DepartmentId == departmentId, ct);
        if (request is null)
        {
            return NotFound(http);
        }

        // Claim the request: only one approval/rejection can flip it from pending.
        var claimed = await db.AccessRequests
            .Where(r => r.Id == id && r.Status == AccessRequestStatus.Pending)
            .ExecuteUpdateAsync(s => s
                .SetProperty(r => r.Status, AccessRequestStatus.Approved)
                .SetProperty(r => r.DecidedBy, adminId)
                .SetProperty(r => r.DecidedAt, now), ct);
        if (claimed == 0)
        {
            return AlreadyDecided(http);
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Phone = request.Phone,
            Role = "student",
            IsActive = true,
            PhoneVerifiedAt = request.CreatedAt, // proven by the code at submission
        };
        db.Accounts.Add(account);
        db.Profiles.Add(new Profile
        {
            UserId = account.Id,
            StudentId = request.StudentId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DepartmentId = request.DepartmentId,
            BatchId = request.BatchId,
            SectionId = request.SectionId,
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex, "account_phone_key"))
        {
            return ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number got an account after the request was made.");
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex, "profile_student_id_key"))
        {
            return StudentIdTaken(http);
        }

        await db.AccessRequests.Where(r => r.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.AccountId, account.Id), ct);
        await transaction.CommitAsync(ct);

        await NotifyAsync(sms, loggers, request.Phone,
            "Your UniSync access was approved. Open the app and sign in with this number.", ct);

        var view = await Project(db.AccessRequests.AsNoTracking().Where(r => r.Id == id), db).FirstAsync(ct);
        return ApiResponse.Ok(http, "Approved", view);
    }

    private static async Task<IResult> RejectAsync(
        Guid id, RejectBody? body, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, ISmsSender sms,
        TimeProvider time, ILoggerFactory loggers, CancellationToken ct)
    {
        if (await ManagedDepartmentAsync(user, db, ct) is not { } departmentId)
        {
            return NoDepartment(http);
        }

        var reason = string.IsNullOrWhiteSpace(body?.Reason) ? null : body.Reason.Trim();
        if (reason?.Length > MaxReasonLength)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, $"Keep the reason under {MaxReasonLength} characters.");
        }

        var adminId = UserId(user);
        var rejected = await db.AccessRequests
            .Where(r => r.Id == id && r.DepartmentId == departmentId && r.Status == AccessRequestStatus.Pending)
            .ExecuteUpdateAsync(s => s
                .SetProperty(r => r.Status, AccessRequestStatus.Rejected)
                .SetProperty(r => r.RejectionReason, reason)
                .SetProperty(r => r.DecidedBy, adminId)
                .SetProperty(r => r.DecidedAt, time.GetUtcNow()), ct);

        if (rejected == 0)
        {
            var exists = await db.AccessRequests.AnyAsync(r => r.Id == id && r.DepartmentId == departmentId, ct);
            return exists ? AlreadyDecided(http) : NotFound(http);
        }

        var view = await Project(db.AccessRequests.AsNoTracking().Where(r => r.Id == id), db).FirstAsync(ct);
        await NotifyAsync(sms, loggers, view.Phone,
            "Your UniSync access request was not approved." + (reason is null ? "" : $" Reason: {reason}") +
            " Contact your department if you think this is a mistake.", ct);

        return ApiResponse.Ok(http, "Rejected", view);
    }

    // ---------------------------------------------------------------- helpers

    private static IQueryable<AccessRequestView> Project(IQueryable<AccessRequest> requests, UniSyncDbContext db) =>
        from r in requests
        join b in db.Batches on r.BatchId equals b.Id
        join s in db.Sections on r.SectionId equals s.Id
        select new AccessRequestView(
            r.Id, r.Phone, r.FirstName, r.LastName, r.StudentId,
            new NamedRef(b.Id, b.Name), new NamedRef(s.Id, s.Name),
            r.Status, r.RejectionReason, r.CreatedAt, r.DecidedAt);

    /// <summary>The department an admin manages, or null when the account has no department scope.</summary>
    private static Task<Guid?> ManagedDepartmentAsync(ClaimsPrincipal user, UniSyncDbContext db, CancellationToken ct)
    {
        var userId = UserId(user);
        return db.Accounts.AsNoTracking().Where(a => a.Id == userId).Select(a => a.ManagedDepartmentId).FirstOrDefaultAsync(ct);
    }

    private static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);

    private static async Task<IResult?> AlreadyRegisteredAsync(HttpContext http, UniSyncDbContext db, string phone, CancellationToken ct)
    {
        var account = await db.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Phone == phone, ct);
        if (account is null)
        {
            return null;
        }

        return account.CanSignIn
            ? ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number already has an account. Sign in instead.")
            : ApiResponse.Fail(http, 409, ErrorCodes.AlreadyRegistered, "This number's account was deleted or deactivated. Contact your department.");
    }

    private static async Task NotifyAsync(ISmsSender sms, ILoggerFactory loggers, string phone, string message, CancellationToken ct)
    {
        try
        {
            await sms.SendAsync(phone, message, ct);
        }
        catch (SmsDeliveryException ex)
        {
            // The decision stands; the student sees the result next time they open the app.
            LogNotifyFailed(loggers.CreateLogger(typeof(AccessRequestEndpoints)), ex);
        }
    }

    private static bool IsUniqueViolation(DbUpdateException ex, string constraint) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg && pg.ConstraintName == constraint;

    private static IResult InvalidPhone(HttpContext http) =>
        ApiResponse.Fail(http, 400, ErrorCodes.InvalidPhone, "Enter a Bangladeshi mobile number, like 01712345678.");

    private static IResult Pending(HttpContext http) =>
        ApiResponse.Fail(http, 409, ErrorCodes.RequestPending, "Your request is waiting for your department to review it.");

    private static IResult StudentIdTaken(HttpContext http) =>
        ApiResponse.Fail(http, 409, ErrorCodes.StudentIdTaken, "That student ID is already registered. Check it, or contact your department.");

    private static IResult AlreadyDecided(HttpContext http) =>
        ApiResponse.Fail(http, 409, ErrorCodes.AlreadyDecided, "This request has already been decided.");

    // Requests in other departments are invisible rather than forbidden.
    private static IResult NotFound(HttpContext http) =>
        ApiResponse.Fail(http, 404, ErrorCodes.NotFound, "Request not found.");

    private static IResult NoDepartment(HttpContext http) =>
        ApiResponse.Fail(http, 403, ErrorCodes.Forbidden, "Your account doesn't manage a department.");

    [GeneratedRegex("^[A-Za-z0-9-]{1,32}$")]
    private static partial Regex StudentIdPattern();

    [LoggerMessage(Level = LogLevel.Warning, Message = "Access request decision SMS failed")]
    private static partial void LogNotifyFailed(ILogger logger, Exception exception);
}
