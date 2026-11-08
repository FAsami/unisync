using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using UniSync.Api.Configuration;

namespace UniSync.Api.Common;

/// <summary>
/// The client address used for per-IP rate limits and session records.
///
/// The web app calls the API from its own server, so every admin would otherwise
/// share the web server's address (one bucket for everyone: one person could use
/// up sign-in for all). The web server therefore sends the real client address in
/// <see cref="ClientIpHeader"/>, and proves it is the web server with
/// <see cref="SecretHeader"/>. The header is trusted only when that secret matches
/// <see cref="RateLimitOptions.TrustedProxySecret"/>; anyone else's copy is ignored.
/// </summary>
public static class ClientIp
{
    public const string ClientIpHeader = "X-UniSync-Client-IP";
    public const string SecretHeader = "X-UniSync-Proxy-Secret";

    public static string For(HttpContext http)
    {
        var secret = http.RequestServices.GetRequiredService<IOptions<RateLimitOptions>>().Value.TrustedProxySecret;
        if (!string.IsNullOrEmpty(secret)
            && http.Request.Headers.TryGetValue(SecretHeader, out var presented)
            && FixedTimeEquals(presented.ToString(), secret)
            && IPAddress.TryParse(http.Request.Headers[ClientIpHeader].ToString().Trim(), out var forwarded))
        {
            return forwarded.ToString();
        }

        return http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static bool FixedTimeEquals(string a, string b) =>
        CryptographicOperations.FixedTimeEquals(
            SHA256.HashData(Encoding.UTF8.GetBytes(a)), SHA256.HashData(Encoding.UTF8.GetBytes(b)));
}
