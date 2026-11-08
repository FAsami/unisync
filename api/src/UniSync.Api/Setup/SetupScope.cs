using System.Globalization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record DeletedResult(Guid Id);

public sealed record Ref(Guid Id, string Name);

/// <summary>
/// Department scope for the setup endpoints. Every setup route sits behind
/// <see cref="Policies.DepartmentAdmin"/> plus <see cref="RequireDepartmentAsync"/>,
/// which resolves the admin's managed department once per request (403 if none).
/// Handlers then filter by <see cref="DepartmentId"/>, so another department's
/// records answer 404.
/// </summary>
public static class SetupScope
{
    private const string ItemKey = "setup.departmentId";

    /// <summary>Endpoint filter: refuses admins without a department, otherwise remembers it for the handler.</summary>
    public static async ValueTask<object?> RequireDepartmentAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;
        var userId = UserId(http.User);
        var db = http.RequestServices.GetRequiredService<UniSyncDbContext>();
        var departmentId = await db.Accounts.AsNoTracking()
            .Where(a => a.Id == userId)
            .Select(a => a.ManagedDepartmentId)
            .FirstOrDefaultAsync(http.RequestAborted);
        if (departmentId is null)
        {
            return ApiResponse.Fail(http, 403, ErrorCodes.Forbidden, "Your account doesn't manage a department.");
        }

        http.Items[ItemKey] = departmentId.Value;
        return await next(context);
    }

    /// <summary>A route group for department admins, scoped to their own department.</summary>
    public static RouteGroupBuilder MapDepartmentAdminGroup(this RouteGroupBuilder api, string prefix, string tag) =>
        api.MapGroup(prefix)
            .WithTags(tag)
            .RequireAuthorization(Policies.DepartmentAdmin)
            .AddEndpointFilter(RequireDepartmentAsync);

    public static Guid DepartmentId(HttpContext http) =>
        http.Items[ItemKey] is Guid id ? id : throw new InvalidOperationException("Setup route without the department filter.");

    public static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);

    // ---------------------------------------------------------------- responses

    public static IResult NotFound(HttpContext http, string what) =>
        ApiResponse.Fail(http, 404, ErrorCodes.NotFound, $"{what} not found.");

    public static IResult Invalid(HttpContext http, Dictionary<string, string> errors) =>
        ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Some fields need fixing.", errors);

    public static IResult Exists(HttpContext http, string message) =>
        ApiResponse.Fail(http, 409, ErrorCodes.AlreadyExists, message);

    public static IResult InUse(HttpContext http, string message) =>
        ApiResponse.Fail(http, 409, ErrorCodes.InUse, message);

    public static bool IsUniqueViolation(DbUpdateException ex, string? constraint = null) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg
        && (constraint is null || pg.ConstraintName == constraint);

    // ---------------------------------------------------------------- input

    /// <summary>A "contains" pattern for ILIKE, with the user's % and _ taken literally.</summary>
    public static string ContainsPattern(string term) =>
        "%" + term.Trim().Replace("\\", "\\\\", StringComparison.Ordinal).Replace("%", "\\%", StringComparison.Ordinal)
            .Replace("_", "\\_", StringComparison.Ordinal) + "%";

    /// <summary>Trims; null stays null (unchanged on PATCH).</summary>
    public static string? Clean(string? value) => value?.Trim();

    /// <summary>Optional free text: blank becomes null.</summary>
    public static string? Optional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static void Required(Dictionary<string, string> errors, string field, string? value, int max, string message)
    {
        if (value is null || value.Length == 0 || value.Length > max)
        {
            errors[field] = message;
        }
    }

    /// <summary>For PATCH: only validates when the field was sent.</summary>
    public static void RequiredIfSent(Dictionary<string, string> errors, string field, string? value, int max, string message)
    {
        if (value is not null)
        {
            Required(errors, field, value, max, message);
        }
    }

    public static bool TryDate(string? value, out DateOnly date) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

    public static bool TryTime(string? value, out TimeOnly time) =>
        TimeOnly.TryParseExact(value, ["HH:mm", "HH:mm:ss"], CultureInfo.InvariantCulture, DateTimeStyles.None, out time);

    /// <summary>Parses an optional date field; records an error if it was sent but malformed.</summary>
    public static DateOnly? OptionalDate(Dictionary<string, string> errors, string field, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (TryDate(value, out var date))
        {
            return date;
        }

        errors[field] = "Use a date like 2026-09-01.";
        return null;
    }
}
