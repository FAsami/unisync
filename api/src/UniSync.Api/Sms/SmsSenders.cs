using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using UniSync.Api.Configuration;

namespace UniSync.Api.Sms;

public interface ISmsSender
{
    /// <summary>Sends <paramref name="message"/> to an E.164 number. Throws <see cref="SmsDeliveryException"/> on failure.</summary>
    Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken);
}

public sealed class SmsDeliveryException(string message, Exception? inner = null) : Exception(message, inner);

/// <summary>BulkSMSBD gateway. Parameters go through the query builder so "+" and spaces are encoded.</summary>
public sealed partial class BulkSmsBdSender(HttpClient http, IOptions<SmsOptions> options, ILogger<BulkSmsBdSender> logger) : ISmsSender
{
    public async Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken)
    {
        var o = options.Value;
        var url = QueryHelpers.AddQueryString(o.Endpoint.ToString(), new Dictionary<string, string?>
        {
            ["apikey"] = o.ApiKey,
            ["secretkey"] = o.SecretKey,
            ["callerID"] = o.CallerId,
            ["toUser"] = phoneE164,
            ["messageContent"] = message,
        });

        try
        {
            using var response = await http.GetAsync(new Uri(url), cancellationToken);
            response.EnsureSuccessStatusCode();
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
            var status = json.RootElement.TryGetProperty("Status", out var s) ? s.ToString() : null;
            if (status != "0")
            {
                throw new SmsDeliveryException($"Gateway rejected the message (status {status}).");
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException or TaskCanceledException)
        {
            // Never log the URL: it carries the API key and secret.
            LogFailure(logger, ex.GetType().Name);
            throw new SmsDeliveryException("SMS gateway unreachable.", ex);
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "BulkSMSBD request failed ({ErrorType})")]
    private static partial void LogFailure(ILogger logger, string errorType);
}

/// <summary>Development only (enforced at startup): writes the message, code included, to the log.</summary>
public sealed partial class ConsoleSmsSender(ILogger<ConsoleSmsSender> logger) : ISmsSender
{
    public Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken)
    {
        LogMessage(logger, phoneE164, message);
        return Task.CompletedTask;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "[dev SMS] to {Phone}: {Message}")]
    private static partial void LogMessage(ILogger logger, string phone, string message);
}
