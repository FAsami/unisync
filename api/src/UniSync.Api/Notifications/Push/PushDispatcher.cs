using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using UniSync.Api.Data;

namespace UniSync.Api.Notifications.Push;

/// <summary>
/// Turns new <c>notification.log</c> rows into pushes; this replaces Hasura's
/// event trigger and the Node server's sender. Every writer only inserts a row
/// (status "pending"); this service delivers it and records the outcome, with the
/// same status values the legacy sender used: pending → processing → sent | failed.
///
/// Rows are claimed with <c>FOR UPDATE SKIP LOCKED</c>, so several instances can
/// run at once without sending anything twice. A row stuck in "processing" (its
/// instance died mid-send) is claimed again after <see cref="PushOptions.RetryProcessingAfter"/>.
/// Recipients come from <see cref="AudienceService"/>, the one audience definition.
/// </summary>
public sealed partial class PushDispatcher(
    IServiceScopeFactory scopes, IOptions<PushOptions> options, TimeProvider time, ILogger<PushDispatcher> logger) : BackgroundService
{
    internal const string NoDevicesMessage = "No one in this audience has push turned on; it is in their inbox.";
    internal const string NoUsersMessage = "No users found for target";
    internal const string TooOldMessage = "Too old to push when delivery started; it is in the inbox.";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        if (!settings.Enabled)
        {
            LogDisabled(logger);
            return;
        }

        LogStarted(logger);
        using var timer = new PeriodicTimer(settings.PollInterval, time);
        do
        {
            try
            {
                while (await DeliverPendingAsync(stoppingToken) == settings.BatchSize)
                {
                    // A full batch: there may be more waiting, so don't sleep.
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                LogLoopError(logger, ex);
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    /// <summary>Claims one batch and delivers it. Returns how many rows it claimed (0 when disabled).</summary>
    public async Task<int> DeliverPendingAsync(CancellationToken ct)
    {
        var settings = options.Value;
        if (!settings.Enabled)
        {
            return 0;
        }

        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<UniSyncDbContext>();

        await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE notification.log
               SET status = 'failed', error_message = {TooOldMessage}, processed_at = now()
             WHERE status = 'pending' AND created_at < now() - {settings.MaxAge}
            """, ct);

        var claimed = await db.Database.SqlQuery<Guid>($"""
            UPDATE notification.log
               SET status = 'processing', processed_at = now()
             WHERE id IN (SELECT id FROM notification.log
                           WHERE status = 'pending'
                              OR (status = 'processing' AND processed_at < now() - {settings.RetryProcessingAfter})
                           ORDER BY created_at
                           LIMIT {settings.BatchSize}
                           FOR UPDATE SKIP LOCKED)
            RETURNING id AS "Value"
            """).ToListAsync(ct);

        foreach (var id in claimed)
        {
            await using var rowScope = scopes.CreateAsyncScope();
            await DeliverAsync(rowScope.ServiceProvider, id, ct);
        }

        return claimed.Count;
    }

    private async Task DeliverAsync(IServiceProvider services, Guid id, CancellationToken ct)
    {
        var db = services.GetRequiredService<UniSyncDbContext>();
        try
        {
            var row = await db.Notifications.AsNoTracking().FirstOrDefaultAsync(n => n.Id == id, ct);
            if (row is null)
            {
                return;
            }

            var members = services.GetRequiredService<AudienceService>().Members(row.TargetType ?? "", row.TargetId);
            if (!await members.AnyAsync(ct))
            {
                await FinishAsync(db, id, "failed", 0, 0, NoUsersMessage, ct);
                return;
            }

            var devices = await db.Devices.AsNoTracking()
                .Where(d => d.IsActive && d.Provider == "fcm" && members.Contains(d.UserId))
                .Select(d => new { d.Id, d.Token })
                .ToListAsync(ct);
            if (devices.Count == 0)
            {
                await FinishAsync(db, id, "sent", 0, 0, NoDevicesMessage, ct);
                return;
            }

            var message = new PushMessage(row.Title, row.Body, row.ImageUrl, DataFor(row));
            var sender = services.GetRequiredService<IPushSender>();
            var dead = new ConcurrentBag<Guid>();
            var errors = new ConcurrentBag<string>();
            var sent = 0;

            await Parallel.ForEachAsync(devices, new ParallelOptions { MaxDegreeOfParallelism = options.Value.MaxParallelSends, CancellationToken = ct },
                async (device, token) =>
                {
                    var result = await sender.SendAsync(device.Token, message, token);
                    switch (result.Outcome)
                    {
                        case PushOutcome.Sent:
                            Interlocked.Increment(ref sent);
                            break;
                        case PushOutcome.InvalidToken:
                            dead.Add(device.Id);
                            break;
                        default:
                            errors.Add(result.Error ?? "Push failed");
                            break;
                    }
                });

            if (!dead.IsEmpty)
            {
                // Dead tokens never come back; stop sending to them. The app registers a fresh one on next launch.
                var deadIds = dead.ToList();
                await db.Devices.Where(d => deadIds.Contains(d.Id))
                    .ExecuteUpdateAsync(s => s.SetProperty(d => d.IsActive, false), ct);
            }

            var failed = devices.Count - sent;
            var error = errors.IsEmpty && dead.IsEmpty
                ? null
                : string.Join("; ", errors.Distinct().Order(StringComparer.Ordinal).Take(3)
                    .Concat(dead.IsEmpty ? [] : [$"{dead.Count} expired device token(s) removed"]));
            await FinishAsync(db, id, sent > 0 ? "sent" : "failed", sent, failed, error, ct);
            LogDelivered(logger, id, sent, failed);
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            LogRowError(logger, id, ex);
            await FinishAsync(db, id, "failed", 0, 0, $"Delivery error: {ex.GetType().Name}", CancellationToken.None);
        }
    }

    private Task<int> FinishAsync(UniSyncDbContext db, Guid id, string status, int sent, int failed, string? error, CancellationToken ct) =>
        db.Notifications.Where(n => n.Id == id && n.Status == "processing")
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Status, status)
                .SetProperty(n => n.SentCount, sent)
                .SetProperty(n => n.FailedCount, failed)
                .SetProperty(n => n.ErrorMessage, error is { Length: > 500 } ? error[..500] : error)
                .SetProperty(n => n.ProcessedAt, time.GetUtcNow()), ct);

    /// <summary>
    /// The row's data as FCM wants it: string values only (anything else is sent as
    /// its JSON text), plus <c>notificationId</c> so tapping the push opens it.
    /// </summary>
    internal static Dictionary<string, string> DataFor(NotificationLog row)
    {
        var data = new Dictionary<string, string>(StringComparer.Ordinal);
        if (!string.IsNullOrWhiteSpace(row.Data))
        {
            try
            {
                using var doc = JsonDocument.Parse(row.Data);
                if (doc.RootElement.ValueKind == JsonValueKind.Object)
                {
                    foreach (var p in doc.RootElement.EnumerateObject())
                    {
                        data[p.Name] = p.Value.ValueKind == JsonValueKind.String ? p.Value.GetString()! : p.Value.GetRawText();
                    }
                }
            }
            catch (JsonException)
            {
                // Bad data shouldn't stop the push itself.
            }
        }

        // Always the row's own id, whatever the writer put in data.
        data["notificationId"] = row.Id.ToString();
        return data;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Push delivery is off (Push:Enabled=false)")]
    private static partial void LogDisabled(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Push delivery started")]
    private static partial void LogStarted(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Notification {Id}: pushed to {Sent} device(s), {Failed} failed")]
    private static partial void LogDelivered(ILogger logger, Guid id, int sent, int failed);

    [LoggerMessage(Level = LogLevel.Error, Message = "Notification {Id}: delivery failed")]
    private static partial void LogRowError(ILogger logger, Guid id, Exception ex);

    [LoggerMessage(Level = LogLevel.Error, Message = "Push delivery loop failed; retrying on the next tick")]
    private static partial void LogLoopError(ILogger logger, Exception ex);
}
