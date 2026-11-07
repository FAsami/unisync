using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using UniSync.Api.Auth;
using UniSync.Api.Configuration;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>
/// While both servers run, a token from one must work on the other. These build
/// tokens byte-for-byte the way the Node server's jsonwebtoken library does.
/// </summary>
public class TokenCompatibilityTests
{
    private static readonly TokenService Service = new(
        Options.Create(new AuthOptions { JwtSecret = ApiFactory.JwtSecret }), TimeProvider.System);

    private static string NodeStyleToken(object payload, string secret = ApiFactory.JwtSecret)
    {
        static string B64(byte[] bytes) => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        var header = B64(Encoding.UTF8.GetBytes("""{"alg":"HS256","typ":"JWT"}"""));
        var body = B64(JsonSerializer.SerializeToUtf8Bytes(payload));
        var signature = B64(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"{header}.{body}")));
        return $"{header}.{body}.{signature}";
    }

    private static long Now => DateTimeOffset.UtcNow.ToUnixTimeSeconds();

    [Fact]
    public async Task Node_access_token_is_accepted()
    {
        var token = NodeStyleToken(new { sessionId = "s-1", userId = "u-1", role = "student", typ = "access", iat = Now, exp = Now + 3600 });
        var identity = await Service.ValidateAsync(token, TokenType.Access);
        Assert.NotNull(identity);
        Assert.Equal("u-1", identity.FindFirst(TokenService.UserIdClaim)?.Value);
        Assert.Equal("s-1", identity.FindFirst(TokenService.SessionIdClaim)?.Value);
    }

    [Fact]
    public async Task Node_refresh_token_is_rejected_as_access_token()
    {
        var token = NodeStyleToken(new { sessionId = "s-1", userId = "u-1", role = "student", typ = "refresh", iat = Now, exp = Now + 3600 });
        Assert.Null(await Service.ValidateAsync(token, TokenType.Access));
        Assert.NotNull(await Service.ValidateAsync(token, TokenType.Refresh));
    }

    [Fact]
    public async Task Legacy_untyped_token_is_accepted_for_both()
    {
        var token = NodeStyleToken(new { sessionId = "s-1", userId = "u-1", role = "student", iat = Now, exp = Now + 3600 });
        Assert.NotNull(await Service.ValidateAsync(token, TokenType.Access));
        Assert.NotNull(await Service.ValidateAsync(token, TokenType.Refresh));
    }

    [Fact]
    public async Task Expired_or_wrongly_signed_tokens_are_rejected()
    {
        var expired = NodeStyleToken(new { sessionId = "s-1", userId = "u-1", role = "student", typ = "access", iat = Now - 7200, exp = Now - 3600 });
        var forged = NodeStyleToken(new { sessionId = "s-1", userId = "u-1", role = "student", typ = "access", iat = Now, exp = Now + 3600 }, "another-secret-that-is-also-32-characters!!");
        Assert.Null(await Service.ValidateAsync(expired, TokenType.Access));
        Assert.Null(await Service.ValidateAsync(forged, TokenType.Access));
    }

    [Fact]
    public void Tokens_issued_in_the_same_second_differ()
    {
        var sessionId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var first = Service.Issue(sessionId, userId, "student", TokenType.Refresh).Value;
        var second = Service.Issue(sessionId, userId, "student", TokenType.Refresh).Value;
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void Issued_tokens_carry_the_node_claim_names()
    {
        var sessionId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var token = Service.Issue(sessionId, userId, "teacher", TokenType.Access).Value;

        var payload = token.Split('.')[1].Replace('-', '+').Replace('_', '/');
        payload = payload.PadRight(payload.Length + ((4 - (payload.Length % 4)) % 4), '=');
        using var json = JsonDocument.Parse(Convert.FromBase64String(payload));
        var root = json.RootElement;

        Assert.Equal(sessionId.ToString(), root.GetProperty("sessionId").GetString());
        Assert.Equal(userId.ToString(), root.GetProperty("userId").GetString());
        Assert.Equal("teacher", root.GetProperty("role").GetString());
        Assert.Equal("access", root.GetProperty("typ").GetString());
        Assert.True(root.TryGetProperty("exp", out _));
    }
}
