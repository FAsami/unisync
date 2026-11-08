using System.ComponentModel.DataAnnotations;
using System.Text;

namespace UniSync.Api.Notifications.Push;

/// <summary>
/// Push delivery from <c>notification.log</c>. Off by default: while Hasura's event
/// trigger still sends pushes through the Node server, turning this on would send
/// every notification twice. Turn it on at the cut-over, as Hasura goes off.
/// </summary>
public sealed class PushOptions
{
    public const string SectionName = "Push";

    public bool Enabled { get; set; }

    /// <summary>
    /// The Firebase service-account key (the JSON file's contents, or the same
    /// base64-encoded so it fits in one environment variable). A secret: set it
    /// with <c>fly secrets set Push__FcmServiceAccountJson=...</c>, never in a file.
    /// </summary>
    public string? FcmServiceAccountJson { get; set; }

    /// <summary>How often to look for new notifications when the queue is empty.</summary>
    public TimeSpan PollInterval { get; set; } = TimeSpan.FromSeconds(3);

    [Range(1, 500)]
    public int BatchSize { get; set; } = 20;

    /// <summary>A row left in "processing" this long (its sender crashed) is picked up again.</summary>
    public TimeSpan RetryProcessingAfter { get; set; } = TimeSpan.FromMinutes(10);

    /// <summary>
    /// Pending rows older than this are marked failed instead of pushed, so turning
    /// delivery on doesn't buzz phones with a backlog of old news. They stay in the inbox.
    /// </summary>
    public TimeSpan MaxAge { get; set; } = TimeSpan.FromHours(1);

    [Range(1, 64)]
    public int MaxParallelSends { get; set; } = 8;

    /// <summary>The service-account JSON, decoded from base64 if needed; null when not set.</summary>
    public string? ServiceAccountJson()
    {
        var value = FcmServiceAccountJson?.Trim();
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        if (value.StartsWith('{'))
        {
            return value;
        }

        try
        {
            return Encoding.UTF8.GetString(Convert.FromBase64String(value));
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
