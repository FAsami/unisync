using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Auth;

public sealed record AuthTokens(
    Guid SessionId,
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    string Role);

public sealed record RefreshResult(AuthTokens? Tokens, string? ErrorCode, string? Message);

/// <summary>
/// Creates, rotates and revokes sessions. The user_session row id always equals
/// the tokens' sessionId claim: refresh and logout depend on it.
/// </summary>
public sealed class SessionService(UniSyncDbContext db, TokenService tokens, TimeProvider time)
{
    public async Task<AuthTokens> IssueAsync(Account account, HttpContext http, CancellationToken ct)
    {
        var sessionId = Guid.NewGuid();
        var access = tokens.Issue(sessionId, account.Id, account.Role, TokenType.Access);
        var refresh = tokens.Issue(sessionId, account.Id, account.Role, TokenType.Refresh);
        var now = time.GetUtcNow();

        db.Sessions.Add(new Session
        {
            Id = sessionId,
            UserId = account.Id,
            AccessToken = access.Value,
            AccessTokenExpiresAt = access.ExpiresAt,
            RefreshToken = refresh.Value,
            RefreshTokenExpiresAt = refresh.ExpiresAt,
            IpAddress = ClientIp.For(http),
            UserAgent = http.Request.Headers.UserAgent.ToString(),
            LastUsedAt = now,
        });
        await db.SaveChangesAsync(ct);

        return new AuthTokens(sessionId, access.Value, access.ExpiresAt, refresh.Value, refresh.ExpiresAt, account.Role);
    }

    /// <summary>
    /// Rotates both tokens. Presenting an already-rotated refresh token means it
    /// leaked or was replayed, so the whole session is revoked.
    /// </summary>
    public async Task<RefreshResult> RefreshAsync(string refreshToken, CancellationToken ct)
    {
        var identity = await tokens.ValidateAsync(refreshToken, TokenType.Refresh);
        if (identity is null
            || !Guid.TryParse(identity.FindFirst(TokenService.SessionIdClaim)?.Value, out var sessionId)
            || !Guid.TryParse(identity.FindFirst(TokenService.UserIdClaim)?.Value, out var userId))
        {
            return new(null, ErrorCodes.Unauthorized, "Your session is not valid. Please sign in again.");
        }

        var session = await db.Sessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct);
        if (session is null || session.Revoked)
        {
            return new(null, ErrorCodes.SessionRevoked, "You have been signed out. Please sign in again.");
        }

        if (!FixedTimeEquals(session.RefreshToken, refreshToken))
        {
            session.Revoked = true;
            await db.SaveChangesAsync(ct);
            return new(null, ErrorCodes.SessionRevoked, "You have been signed out. Please sign in again.");
        }

        var account = await db.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == userId, ct);
        if (account is null || !account.CanSignIn)
        {
            session.Revoked = true;
            await db.SaveChangesAsync(ct);
            return new(null, ErrorCodes.SessionRevoked, "This account can no longer sign in.");
        }

        // Role comes from the account, so a role change applies at the next refresh.
        var access = tokens.Issue(sessionId, userId, account.Role, TokenType.Access);
        var refresh = tokens.Issue(sessionId, userId, account.Role, TokenType.Refresh);
        // Compare-and-swap on the old token: of two refreshes racing with the same
        // token only one can rotate it; the other is a replay and revokes the session.
        var now = time.GetUtcNow();
        var rotated = await db.Sessions
            .Where(s => s.Id == sessionId && !s.Revoked && s.RefreshToken == refreshToken)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.AccessToken, access.Value)
                .SetProperty(x => x.AccessTokenExpiresAt, access.ExpiresAt)
                .SetProperty(x => x.RefreshToken, refresh.Value)
                .SetProperty(x => x.RefreshTokenExpiresAt, refresh.ExpiresAt)
                .SetProperty(x => x.LastUsedAt, now), ct);
        if (rotated == 0)
        {
            await RevokeAsync(sessionId, ct);
            return new(null, ErrorCodes.SessionRevoked, "You have been signed out. Please sign in again.");
        }

        return new(new AuthTokens(sessionId, access.Value, access.ExpiresAt, refresh.Value, refresh.ExpiresAt, account.Role), null, null);
    }

    public Task<int> RevokeAsync(Guid sessionId, CancellationToken ct) =>
        db.Sessions.Where(s => s.Id == sessionId && !s.Revoked)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Revoked, true), ct);

    private static bool FixedTimeEquals(string a, string b) =>
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));
}
