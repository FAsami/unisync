namespace UniSync.Api.Data;

// Mapped onto the existing Postgres schema (originally created through Hasura).
// Column names come from the snake_case naming convention; see UniSyncDbContext.

public sealed class Account
{
    public Guid Id { get; set; }
    public string Phone { get; set; } = "";
    public string? Email { get; set; }
    public DateTimeOffset? PhoneVerifiedAt { get; set; }
    public string Role { get; set; } = "student";
    /// <summary>Legacy column; null for roster accounts (sign-in is passwordless).</summary>
    public string? Password { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? DeletedAt { get; set; }
    /// <summary>For role "admin": the department this admin manages. Null = no department scope.</summary>
    public Guid? ManagedDepartmentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public bool CanSignIn => IsActive && DeletedAt is null;
}

public sealed class Session
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    // Raw tokens are stored because the legacy Node server compares them by value.
    // Switch to hashes once the Node server is retired.
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public DateTimeOffset AccessTokenExpiresAt { get; set; }
    public DateTimeOffset RefreshTokenExpiresAt { get; set; }
    public bool Revoked { get; set; }
    public string IpAddress { get; set; } = "";
    public string UserAgent { get; set; } = "";
    public DateTimeOffset LastUsedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class OtpTransaction
{
    public Guid Id { get; set; }
    public string Identifier { get; set; } = "";
    public string IdentifierType { get; set; } = "PHONE";
    public string Purpose { get; set; } = "";
    public string OtpHash { get; set; } = "";
    public int Attempts { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool Verified { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class Profile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? StudentId { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public Guid DepartmentId { get; set; }
    public Guid? BatchId { get; set; }
    public Guid? SectionId { get; set; }
}

public sealed partial class Department
{
    public Guid Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsActive { get; set; }
}

public sealed partial class Batch
{
    public Guid Id { get; set; }
    /// <summary>Column is misspelled <c>departmant_id</c> in the legacy schema.</summary>
    public Guid DepartmentId { get; set; }
    public string Name { get; set; } = "";
    public bool IsActive { get; set; }
}

public sealed partial class Section
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public Guid BatchId { get; set; }
    public bool IsActive { get; set; }
}

public static class AccessRequestStatus
{
    public const string Pending = "pending";
    public const string Approved = "approved";
    public const string Rejected = "rejected";
}

/// <summary>A request to join from a phone that is not on any department roster.</summary>
public sealed class AccessRequest
{
    public Guid Id { get; set; }
    public string Phone { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string StudentId { get; set; } = "";
    public Guid DepartmentId { get; set; }
    public Guid BatchId { get; set; }
    public Guid SectionId { get; set; }
    public string Status { get; set; } = AccessRequestStatus.Pending;
    public string? RejectionReason { get; set; }
    public Guid? DecidedBy { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    /// <summary>The account created on approval.</summary>
    public Guid? AccountId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>A student marked as class representative for one section (not a separate role).</summary>
public sealed partial class ClassRepresentative
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid SectionId { get; set; }
    public Guid BatchId { get; set; }
    public bool IsActive { get; set; }
}

// ---- Timetable

/// <summary>A weekly class slot. Times are campus-local; DayOfWeek uses 0 = Sunday, matching System.DayOfWeek.</summary>
public sealed class Routine
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public Guid? CourseOfferingId { get; set; }
    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string EventType { get; set; } = "lecture";
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly EffectiveTo { get; set; }
    public bool IsActive { get; set; }
    public Guid? RoomId { get; set; }
    /// <summary>Legacy JSON; may hold a free-text "room_number".</summary>
    public string? Metadata { get; set; }
}

public static class ClassChangeType
{
    public const string Cancellation = "cancellation";
    public const string Reschedule = "reschedule";
    public const string RoomChange = "room_change";
}

/// <summary>A change to one occurrence of a routine (one per routine and date). Table: event.routine_exception.</summary>
public sealed class ClassChange
{
    public Guid Id { get; set; }
    public Guid? RoutineId { get; set; }
    public DateOnly ExceptionDate { get; set; }
    public string Type { get; set; } = ClassChangeType.Cancellation;
    public string Reason { get; set; } = "";
    public DateOnly? NewDate { get; set; }
    public TimeOnly? NewStartTime { get; set; }
    public TimeOnly? NewEndTime { get; set; }
    public Guid? NewRoomId { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed partial class CourseOffering
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid BatchId { get; set; }
    public Guid SectionId { get; set; }
    /// <summary>The teacher's account id.</summary>
    public Guid TeacherId { get; set; }
    public bool IsActive { get; set; }
}

public sealed partial class Course
{
    public Guid Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
}

public sealed partial class Room
{
    public Guid Id { get; set; }
    public Guid BuildingId { get; set; }
    public string RoomNumber { get; set; } = "";
    public string RoomName { get; set; } = "";
}

public sealed partial class Building
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
}

/// <summary>Teacher details (legacy table user.faculty).</summary>
public sealed partial class TeacherProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid DepartmentId { get; set; }
}

/// <summary>
/// A notification to an audience (notification.log). Writers only insert the row;
/// <c>PushDispatcher</c> pushes it to the audience's devices (or, until the
/// cut-over, the legacy Hasura event trigger does).
/// </summary>
public sealed class NotificationLog
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    /// <summary>all | department | batch | section | user</summary>
    public string? TargetType { get; set; }
    public Guid TargetId { get; set; }
    /// <summary>JSON object of string values (FCM data payloads accept strings only).</summary>
    public string? Data { get; set; }
    public Guid CreatedBy { get; set; }
    public string? ImageUrl { get; set; }
    /// <summary>Push delivery state, written by <c>PushDispatcher</c>: pending | processing | sent | failed.</summary>
    public string Status { get; set; } = "pending";
    public int SentCount { get; set; }
    public int FailedCount { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class NotificationRead
{
    public Guid UserId { get; set; }
    public Guid NotificationId { get; set; }
    public DateTimeOffset ReadAt { get; set; }
}

/// <summary>A push token (legacy table user.device). Unique per (user, device, provider).</summary>
public sealed class Device
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DeviceId { get; set; } = "";
    public string Provider { get; set; } = "fcm";
    public string Token { get; set; } = "";
    public string Platform { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTimeOffset LastUsedAt { get; set; }
}
