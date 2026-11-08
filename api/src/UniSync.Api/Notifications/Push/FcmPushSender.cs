using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace UniSync.Api.Notifications.Push;

/// <summary>
/// Firebase Cloud Messaging, HTTP v1 API: one request per device token, authorised
/// with an OAuth token minted from the service-account key (Google.Apis.Auth caches
/// and refreshes it). Logs and errors never include the device token.
/// </summary>
public sealed class FcmPushSender : IPushSender
{
    private const string Scope = "https://www.googleapis.com/auth/firebase.messaging";

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly HttpClient _http;
    private readonly Lazy<(ITokenAccess Credential, string ProjectId)> _account;

    public FcmPushSender(HttpClient http, IOptions<PushOptions> options)
    {
        _http = http;
        _account = new(() => Load(options.Value), LazyThreadSafetyMode.ExecutionAndPublication);
    }

    /// <summary>Parses the key; throws if it isn't a usable service-account key. Used for the startup check too.</summary>
    internal static (ITokenAccess Credential, string ProjectId) Load(PushOptions options)
    {
        var json = options.ServiceAccountJson()
            ?? throw new InvalidOperationException("Push:FcmServiceAccountJson is not set (or is not JSON / base64 JSON).");
        var account = CredentialFactory.FromJson<ServiceAccountCredential>(json);
        if (string.IsNullOrWhiteSpace(account.ProjectId))
        {
            throw new InvalidOperationException("Push:FcmServiceAccountJson has no project_id.");
        }

        return (account.ToGoogleCredential().CreateScoped(Scope), account.ProjectId);
    }

    public async Task<PushResult> SendAsync(string token, PushMessage message, CancellationToken cancellationToken)
    {
        var (credential, projectId) = _account.Value;
        var accessToken = await credential.GetAccessTokenForRequestAsync(cancellationToken: cancellationToken);

        var payload = new
        {
            message = new
            {
                token,
                notification = new { title = message.Title, body = message.Body, image = message.ImageUrl },
                data = message.Data,
            },
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, new Uri($"https://fcm.googleapis.com/v1/projects/{Uri.EscapeDataString(projectId)}/messages:send"))
        {
            Content = JsonContent.Create(payload, options: Json),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        HttpResponseMessage response;
        try
        {
            response = await _http.SendAsync(request, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            return new PushResult(PushOutcome.Failed, $"FCM unreachable: {ex.HttpRequestError}");
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return new PushResult(PushOutcome.Failed, "FCM timed out");
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                return new PushResult(PushOutcome.Sent);
            }

            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            return Classify((int)response.StatusCode, body);
        }
    }

    /// <summary>
    /// Maps an FCM error to an outcome. Dead tokens: UNREGISTERED, SENDER_ID_MISMATCH,
    /// and INVALID_ARGUMENT about the registration token (the same set firebase-admin
    /// treats as "remove this token"). Only FCM's codes go into the error, not its text.
    /// </summary>
    internal static PushResult Classify(int httpStatus, string body)
    {
        string? status = null, errorCode = null, text = null;
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var error))
            {
                status = error.TryGetProperty("status", out var s) ? s.GetString() : null;
                text = error.TryGetProperty("message", out var m) ? m.GetString() : null;
                if (error.TryGetProperty("details", out var details) && details.ValueKind == JsonValueKind.Array)
                {
                    errorCode = details.EnumerateArray()
                        .Select(d => d.TryGetProperty("errorCode", out var c) ? c.GetString() : null)
                        .FirstOrDefault(c => c is not null);
                }
            }
        }
        catch (JsonException)
        {
            // Not JSON (a proxy's error page): fall through with the HTTP status only.
        }

        var code = errorCode ?? status;
        var deadToken = code is "UNREGISTERED" or "SENDER_ID_MISMATCH"
            || (code == "INVALID_ARGUMENT" && text?.Contains("registration token", StringComparison.OrdinalIgnoreCase) == true);

        return new PushResult(deadToken ? PushOutcome.InvalidToken : PushOutcome.Failed, $"FCM {httpStatus} {code ?? "error"}");
    }
}
