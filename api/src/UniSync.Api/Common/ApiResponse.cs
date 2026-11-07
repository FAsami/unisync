namespace UniSync.Api.Common;

/// <summary>
/// The one response shape every endpoint returns, success or failure:
/// <c>{ success, message, data, error: { code, message, details }, meta }</c>.
/// Clients branch on <c>success</c> and show <c>error.message</c>.
/// </summary>
public sealed record ApiEnvelope<T>(bool Success, string? Message, T? Data, ApiError? Error, ApiMeta Meta);

public sealed record ApiError(string Code, string Message, object? Details = null);

public sealed record ApiMeta(DateTimeOffset Timestamp, string Path, string? RequestId);

public static class ApiResponse
{
    public static IResult Ok<T>(HttpContext context, string message, T data, int statusCode = StatusCodes.Status200OK) =>
        Results.Json(new ApiEnvelope<T>(true, message, data, null, Meta(context)), statusCode: statusCode);

    public static IResult Fail(HttpContext context, int statusCode, string code, string message, object? details = null) =>
        Results.Json(new ApiEnvelope<object>(false, null, null, new ApiError(code, message, details), Meta(context)), statusCode: statusCode);

    /// <summary>For middleware that writes the response directly (auth challenges, rate limiter).</summary>
    public static Task WriteFailAsync(HttpContext context, int statusCode, string code, string message, object? details = null)
    {
        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsJsonAsync(new ApiEnvelope<object>(false, null, null, new ApiError(code, message, details), Meta(context)));
    }

    private static ApiMeta Meta(HttpContext context) =>
        new(DateTimeOffset.UtcNow, context.Request.Path, context.TraceIdentifier);
}

/// <summary>Stable error codes clients may branch on. Never rename one without updating both apps.</summary>
public static class ErrorCodes
{
    public const string InvalidRequest = "INVALID_REQUEST";
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string InvalidPhone = "INVALID_PHONE";
    public const string PhoneNotRegistered = "PHONE_NOT_REGISTERED";
    public const string TooManyCodes = "TOO_MANY_CODES";
    public const string SmsFailed = "SMS_FAILED";
    public const string InvalidCode = "INVALID_CODE";
    public const string CodeExpired = "CODE_EXPIRED";
    public const string TooManyAttempts = "TOO_MANY_ATTEMPTS";
    public const string AlreadyRegistered = "ALREADY_REGISTERED";
    public const string RequestPending = "REQUEST_PENDING";
    public const string StudentIdTaken = "STUDENT_ID_TAKEN";
    public const string InvalidSection = "INVALID_SECTION";
    public const string AlreadyDecided = "ALREADY_DECIDED";
    public const string NotAClassDay = "NOT_A_CLASS_DAY";
    public const string ClassInPast = "CLASS_IN_PAST";
    public const string SectionBusy = "SECTION_BUSY";
    public const string TeacherBusy = "TEACHER_BUSY";
    public const string RoomTaken = "ROOM_TAKEN";
    public const string AudienceNotAllowed = "AUDIENCE_NOT_ALLOWED";
    public const string EmptyAudience = "EMPTY_AUDIENCE";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string TokenExpired = "TOKEN_EXPIRED";
    public const string SessionRevoked = "SESSION_REVOKED";
    public const string Forbidden = "FORBIDDEN";
    public const string NotFound = "NOT_FOUND";
    public const string RateLimited = "RATE_LIMITED";
    public const string Internal = "INTERNAL_ERROR";
}
