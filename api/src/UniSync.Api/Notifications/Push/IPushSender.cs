namespace UniSync.Api.Notifications.Push;

/// <summary>What a phone shows. <see cref="Data"/> values are strings (FCM accepts nothing else).</summary>
public sealed record PushMessage(string Title, string Body, string? ImageUrl, IReadOnlyDictionary<string, string> Data);

public enum PushOutcome
{
    Sent,

    /// <summary>The token is dead (app uninstalled, token rotated, other project): stop using it.</summary>
    InvalidToken,

    /// <summary>Anything else (network, quota, server error). The token is kept.</summary>
    Failed,
}

public sealed record PushResult(PushOutcome Outcome, string? Error = null);

/// <summary>Sends one push to one device token.</summary>
public interface IPushSender
{
    Task<PushResult> SendAsync(string token, PushMessage message, CancellationToken cancellationToken);
}

/// <summary>Development only: logs that a push would go out. Never logs the token.</summary>
public sealed partial class LogPushSender(ILogger<LogPushSender> logger) : IPushSender
{
    public Task<PushResult> SendAsync(string token, PushMessage message, CancellationToken cancellationToken)
    {
        LogPush(logger, message.Title);
        return Task.FromResult(new PushResult(PushOutcome.Sent));
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "[push] would send \"{Title}\" to a device")]
    private static partial void LogPush(ILogger logger, string title);
}
