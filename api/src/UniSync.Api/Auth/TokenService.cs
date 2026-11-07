using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using UniSync.Api.Configuration;

namespace UniSync.Api.Auth;

public enum TokenType
{
    Access,
    Refresh,
}

public sealed record IssuedToken(string Value, DateTimeOffset ExpiresAt);

/// <summary>
/// Issues and validates HS256 JWTs in exactly the format of the legacy Node
/// server (claims sessionId, userId, role, typ), so tokens work against either
/// server during the migration.
/// </summary>
public sealed class TokenService(IOptions<AuthOptions> options, TimeProvider time)
{
    public const string SessionIdClaim = "sessionId";
    public const string UserIdClaim = "userId";
    public const string RoleClaim = "role";
    public const string TypeClaim = "typ";

    private readonly JsonWebTokenHandler _handler = new() { MapInboundClaims = false };

    public IssuedToken Issue(Guid sessionId, Guid userId, string role, TokenType type)
    {
        var o = options.Value;
        var now = time.GetUtcNow();
        var expires = now + (type == TokenType.Access ? o.AccessTokenLifetime : o.RefreshTokenLifetime);

        var token = _handler.CreateToken(new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                [SessionIdClaim] = sessionId.ToString(),
                [UserIdClaim] = userId.ToString(),
                [RoleClaim] = role,
                [TypeClaim] = type == TokenType.Access ? "access" : "refresh",
                // Unique per token: without it two tokens issued in the same second
                // are byte-identical, which defeats refresh rotation and replay detection.
                [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString("N"),
            },
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expires.UtcDateTime,
            SigningCredentials = new SigningCredentials(CreateKey(o), SecurityAlgorithms.HmacSha256),
        });

        return new IssuedToken(token, expires);
    }

    /// <summary>Signature + lifetime + type. A token of the other type is rejected; legacy untyped tokens pass.</summary>
    public async Task<ClaimsIdentity?> ValidateAsync(string token, TokenType expected)
    {
        var result = await _handler.ValidateTokenAsync(token, CreateValidationParameters(options.Value));
        if (!result.IsValid)
        {
            return null;
        }

        var typ = result.ClaimsIdentity.FindFirst(TypeClaim)?.Value;
        return IsOfType(typ, expected) ? result.ClaimsIdentity : null;
    }

    internal static bool IsOfType(string? typ, TokenType expected) =>
        typ is null || typ == (expected == TokenType.Access ? "access" : "refresh");

    public static TokenValidationParameters CreateValidationParameters(AuthOptions o) => new()
    {
        // The Node server issues tokens with no issuer or audience.
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        RequireExpirationTime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = CreateKey(o),
        ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        ClockSkew = TimeSpan.FromSeconds(30),
        NameClaimType = UserIdClaim,
        RoleClaimType = RoleClaim,
    };

    private static SymmetricSecurityKey CreateKey(AuthOptions o) => new(Encoding.UTF8.GetBytes(o.JwtSecret));
}
