using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using UniSync.Api.Common;
using UniSync.Api.Configuration;
using UniSync.Api.Data;
using UniSync.Api.Sms;

namespace UniSync.Api.Auth;

public sealed record RequestCodeBody(string? Phone);
public sealed record CodeSent(string Phone, int ExpiresInSeconds);
public sealed record VerifyCodeBody(string? Phone, string? Code);
public sealed record RefreshBody(string? RefreshToken);
public sealed record LogoutBody(string? DeviceId);

/// <summary>Passwordless sign-in: phone → one-time code → session (UX review decision 1).</summary>
public static partial class AuthEndpoints
{
    public const string CodePolicy = "auth-code";
    public const string VerifyPolicy = "auth-verify";

    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder api)
    {
        var auth = api.MapGroup("/auth").WithTags("Auth");
        auth.MapPost("/code", RequestCodeAsync).RequireRateLimiting(CodePolicy).Returns<CodeSent>();
        auth.MapPost("/verify", VerifyCodeAsync).RequireRateLimiting(VerifyPolicy).Returns<AuthTokens>();
        auth.MapPost("/refresh", RefreshAsync).RequireRateLimiting(VerifyPolicy).Returns<AuthTokens>();
        auth.MapPost("/logout", LogoutAsync).RequireAuthorization().Returns<object>();
        return api;
    }

    private static async Task<IResult> RequestCodeAsync(
        RequestCodeBody body, HttpContext http, UniSyncDbContext db, OtpService otp, ISmsSender sms,
        IOptions<OtpOptions> otpOptions, ILoggerFactory loggers, CancellationToken ct)
    {
        if (!PhoneNumber.TryNormalize(body.Phone, out var phone))
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.InvalidPhone, "Enter a Bangladeshi mobile number, like 01712345678.");
        }

        // Roster check: only accounts a department imported can sign in. The app
        // offers "Request access" on this error (UX review decision 1).
        var account = await db.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Phone == phone, ct);
        if (account is null || !account.CanSignIn)
        {
            return ApiResponse.Fail(http, 404, ErrorCodes.PhoneNotRegistered, "This number isn't on your department's list yet.");
        }

        return await SendCodeAsync(http, otp, sms, otpOptions.Value, loggers, phone, OtpService.SignInPurpose,
            code => $"{code} is your UniSync sign-in code. It expires in {(int)otpOptions.Value.Lifetime.TotalMinutes} minutes.", ct);
    }

    /// <summary>Per-phone limit, code creation and SMS: shared by every flow that texts a code.</summary>
    internal static async Task<IResult> SendCodeAsync(
        HttpContext http, OtpService otp, ISmsSender sms, OtpOptions options, ILoggerFactory loggers,
        string phone, string purpose, Func<string, string> message, CancellationToken ct)
    {
        if (await otp.SendLimitReachedAsync(phone, purpose, ct))
        {
            return ApiResponse.Fail(http, 429, ErrorCodes.TooManyCodes, "Too many codes requested. Try again in an hour.");
        }

        var code = await otp.CreateAsync(phone, purpose, ct);
        try
        {
            await sms.SendAsync(phone, message(code), ct);
        }
        catch (SmsDeliveryException ex)
        {
            LogSmsFailed(loggers.CreateLogger(typeof(AuthEndpoints)), ex);
            return ApiResponse.Fail(http, 502, ErrorCodes.SmsFailed, "We couldn't send the code. Try again in a minute.");
        }

        return ApiResponse.Ok(http, "Code sent", new CodeSent(phone, (int)options.Lifetime.TotalSeconds));
    }

    private static async Task<IResult> VerifyCodeAsync(
        VerifyCodeBody body, HttpContext http, UniSyncDbContext db, OtpService otp, SessionService sessions,
        IOptions<OtpOptions> otpOptions, TimeProvider time, CancellationToken ct)
    {
        if (!PhoneNumber.TryNormalize(body.Phone, out var phone))
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.InvalidPhone, "Enter a Bangladeshi mobile number, like 01712345678.");
        }

        var length = otpOptions.Value.Length;
        if (body.Code is null || body.Code.Length != length || !DigitsOnly().IsMatch(body.Code))
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.InvalidCode, $"Enter the {length}-digit code from the SMS.");
        }

        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Phone == phone, ct);
        if (account is null || !account.CanSignIn)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.InvalidCode, "That code is not valid. Request a new one.");
        }

        var check = await otp.CheckAndConsumeAsync(phone, OtpService.SignInPurpose, code: body.Code, ct);
        if (!check.Ok)
        {
            object? details = check.AttemptsRemaining is { } left ? new { attemptsRemaining = left } : null;
            return ApiResponse.Fail(http, 400, check.ErrorCode!, check.Message!, details);
        }

        if (account.PhoneVerifiedAt is null)
        {
            account.PhoneVerifiedAt = time.GetUtcNow();
            await db.SaveChangesAsync(ct);
        }

        var tokens = await sessions.IssueAsync(account, http, ct);
        return ApiResponse.Ok(http, "Signed in", tokens);
    }

    private static async Task<IResult> RefreshAsync(RefreshBody body, HttpContext http, SessionService sessions, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.RefreshToken))
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.InvalidRequest, "refreshToken is required.");
        }

        var result = await sessions.RefreshAsync(body.RefreshToken, ct);
        return result.Tokens is { } tokens
            ? ApiResponse.Ok(http, "Session refreshed", tokens)
            : ApiResponse.Fail(http, 401, result.ErrorCode!, result.Message!);
    }

    /// <summary>
    /// Ends the session. With a deviceId, that device also stops getting pushes
    /// in the same call, so a signed-out phone can't keep receiving the user's
    /// notifications.
    /// </summary>
    private static async Task<IResult> LogoutAsync(
        LogoutBody? body, ClaimsPrincipal user, HttpContext http, SessionService sessions, UniSyncDbContext db, CancellationToken ct)
    {
        var sessionId = Guid.Parse(user.FindFirstValue(TokenService.SessionIdClaim)!);
        if (!string.IsNullOrWhiteSpace(body?.DeviceId))
        {
            var userId = Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);
            await Notifications.DeviceEndpoints.DeactivateAsync(userId, body.DeviceId.Trim(), db, ct);
        }

        await sessions.RevokeAsync(sessionId, ct);
        return ApiResponse.Ok<object?>(http, "Signed out", null);
    }

    [GeneratedRegex("^[0-9]+$")]
    private static partial Regex DigitsOnly();

    [LoggerMessage(Level = LogLevel.Warning, Message = "Sign-in code SMS failed")]
    private static partial void LogSmsFailed(ILogger logger, Exception exception);
}
