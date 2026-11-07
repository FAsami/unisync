using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Auth;

/// <summary>
/// Runs after the JWT signature and lifetime check on every authenticated request:
/// rejects refresh tokens, revoked sessions and deleted or deactivated accounts,
/// so logout and account deletion take effect immediately rather than at token expiry.
/// </summary>
public sealed class BearerEvents : JwtBearerEvents
{
    public BearerEvents()
    {
        OnTokenValidated = ValidateSessionAsync;
        OnChallenge = WriteChallengeAsync;
        OnForbidden = context => ApiResponse.WriteFailAsync(context.HttpContext, StatusCodes.Status403Forbidden, ErrorCodes.Forbidden, "You don't have access to this.");
    }

    private static async Task ValidateSessionAsync(TokenValidatedContext context)
    {
        var principal = context.Principal!;
        if (!TokenService.IsOfType(principal.FindFirst(TokenService.TypeClaim)?.Value, TokenType.Access))
        {
            context.Fail("Refresh tokens cannot be used as access tokens.");
            return;
        }

        if (!Guid.TryParse(principal.FindFirst(TokenService.SessionIdClaim)?.Value, out var sessionId)
            || !Guid.TryParse(principal.FindFirst(TokenService.UserIdClaim)?.Value, out var userId))
        {
            context.Fail("Token is missing its session or user."); // includes legacy guest tokens
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<UniSyncDbContext>();
        var active = await db.Sessions.AsNoTracking()
            .Where(s => s.Id == sessionId && s.UserId == userId && !s.Revoked)
            .Join(db.Accounts, s => s.UserId, a => a.Id, (s, a) => a)
            .AnyAsync(a => a.IsActive && a.DeletedAt == null, context.HttpContext.RequestAborted);

        if (!active)
        {
            context.HttpContext.Items[RevokedKey] = true;
            context.Fail("Session revoked or account inactive.");
        }
    }

    private const string RevokedKey = "unisync.session-revoked";

    private static Task WriteChallengeAsync(JwtBearerChallengeContext context)
    {
        context.HandleResponse();
        var (code, message) = context.AuthenticateFailure switch
        {
            SecurityTokenExpiredException => (ErrorCodes.TokenExpired, "Your session has expired. Refresh your token."),
            _ when context.HttpContext.Items.ContainsKey(RevokedKey) => (ErrorCodes.SessionRevoked, "You have been signed out. Please sign in again."),
            _ => (ErrorCodes.Unauthorized, "Sign in to continue."),
        };
        return ApiResponse.WriteFailAsync(context.HttpContext, StatusCodes.Status401Unauthorized, code, message);
    }
}
