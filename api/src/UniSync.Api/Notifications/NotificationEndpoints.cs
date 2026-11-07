using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Notifications;

public sealed record InboxItem(
    Guid Id, string Title, string Body, string Kind, IReadOnlyDictionary<string, string> Data,
    string? From, DateTimeOffset CreatedAt, bool Read);

public sealed record InboxPage(IReadOnlyList<InboxItem> Items, int UnreadCount, DateTimeOffset? NextBefore);

public sealed record AudienceRef(string? Type, Guid? Id);

public sealed record SendBody(string? Title, string? Body, AudienceRef? Audience);

public sealed record SendResult(Guid Id, int Recipients);

public sealed record MarkedResult(int Marked);

public sealed record SentItem(
    Guid Id, string Title, string Body, string Audience, string Status,
    int SentCount, int FailedCount, int ReadCount, DateTimeOffset CreatedAt);

/// <summary>
/// The inbox (UX review decision 4) and sending notices to the audiences the
/// sender may address. Delivery as push still happens through the legacy
/// Hasura trigger on notification.log until the cut-over.
/// </summary>
public static class NotificationEndpoints
{
    public const string SendPolicy = "notifications-send";
    private static readonly TimeSpan InboxWindow = TimeSpan.FromDays(90);
    private const int MaxTitle = 100;
    private const int MaxBody = 1000;

    public static RouteGroupBuilder MapNotificationEndpoints(this RouteGroupBuilder api)
    {
        var inbox = api.MapGroup("/me/notifications").WithTags("Inbox").RequireAuthorization();
        inbox.MapGet("/", GetInboxAsync).Returns<InboxPage>();
        inbox.MapGet("/{id:guid}", GetOneAsync).Returns<InboxItem>();
        inbox.MapPost("/{id:guid}/read", MarkReadAsync).Returns<object>();
        inbox.MapPost("/read-all", MarkAllReadAsync).Returns<MarkedResult>();

        var send = api.MapGroup("/notifications").WithTags("Notifications").RequireAuthorization();
        send.MapGet("/audiences", GetAudiencesAsync).Returns<List<AudienceOption>>();
        send.MapPost("/", SendAsync).RequireRateLimiting(SendPolicy).Returns<SendResult>(StatusCodes.Status201Created);
        send.MapGet("/sent", GetSentAsync).Returns<List<SentItem>>();
        return api;
    }

    // ---------------------------------------------------------------- inbox

    private static async Task<IResult> GetInboxAsync(
        ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, AudienceService audiences, TimeProvider time,
        string? before, int? limit, CancellationToken ct)
    {
        var take = limit ?? 30;
        if (take is < 1 or > 100)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "limit must be between 1 and 100.");
        }

        DateTimeOffset? cursor = null;
        if (before is not null)
        {
            if (!DateTimeOffset.TryParse(before, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
            {
                return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "before must be a timestamp from nextBefore.");
            }

            cursor = parsed.ToUniversalTime();
        }

        var userId = UserId(user);
        var since = time.GetUtcNow() - InboxWindow;
        var mine = (await audiences.InboxAsync(userId, ct)).Where(n => n.CreatedAt >= since);

        var unread = await mine.CountAsync(n => !db.NotificationReads.Any(r => r.UserId == userId && r.NotificationId == n.Id), ct);
        var page = cursor is { } c ? mine.Where(n => n.CreatedAt < c) : mine;
        var items = await ProjectAsync(page.OrderByDescending(n => n.CreatedAt).Take(take + 1), db, userId, ct);

        var hasMore = items.Count > take;
        if (hasMore)
        {
            items.RemoveAt(items.Count - 1);
        }

        return ApiResponse.Ok(http, "OK", new InboxPage(items, unread, hasMore ? items[^1].CreatedAt : null));
    }

    private static async Task<IResult> GetOneAsync(
        Guid id, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, AudienceService audiences, CancellationToken ct)
    {
        var userId = UserId(user);
        var items = await ProjectAsync((await audiences.InboxAsync(userId, ct)).Where(n => n.Id == id), db, userId, ct);
        return items.Count == 1
            ? ApiResponse.Ok(http, "OK", items[0])
            : ApiResponse.Fail(http, 404, ErrorCodes.NotFound, "Notification not found.");
    }

    private static async Task<IResult> MarkReadAsync(
        Guid id, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, AudienceService audiences, CancellationToken ct)
    {
        var userId = UserId(user);
        if (!await (await audiences.InboxAsync(userId, ct)).AnyAsync(n => n.Id == id, ct))
        {
            return ApiResponse.Fail(http, 404, ErrorCodes.NotFound, "Notification not found.");
        }

        await db.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO notification.read (user_id, notification_id) VALUES ({userId}, {id}) ON CONFLICT DO NOTHING", ct);
        return ApiResponse.Ok<object?>(http, "Marked as read", null);
    }

    private static async Task<IResult> MarkAllReadAsync(
        ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, AudienceService audiences, TimeProvider time, CancellationToken ct)
    {
        var userId = UserId(user);
        var since = time.GetUtcNow() - InboxWindow;
        var unreadIds = await (await audiences.InboxAsync(userId, ct))
            .Where(n => n.CreatedAt >= since && !db.NotificationReads.Any(r => r.UserId == userId && r.NotificationId == n.Id))
            .Select(n => n.Id).ToListAsync(ct);

        db.NotificationReads.AddRange(unreadIds.Select(id => new NotificationRead { UserId = userId, NotificationId = id }));
        await db.SaveChangesAsync(ct);
        return ApiResponse.Ok(http, "All caught up", new MarkedResult(unreadIds.Count));
    }

    private static async Task<List<InboxItem>> ProjectAsync(
        IQueryable<NotificationLog> notifications, UniSyncDbContext db, Guid userId, CancellationToken ct)
    {
        var rows = await (
            from n in notifications
            join p in db.Profiles on n.CreatedBy equals p.UserId into profiles
            from p in profiles.DefaultIfEmpty()
            join t in db.TeacherProfiles on n.CreatedBy equals t.UserId into teachers
            from t in teachers.DefaultIfEmpty()
            select new
            {
                n.Id, n.Title, n.Body, n.Data, n.CreatedAt,
                From = p != null ? p.FirstName + " " + p.LastName : t != null ? t.FirstName + " " + t.LastName : null,
                Read = db.NotificationReads.Any(r => r.UserId == userId && r.NotificationId == n.Id),
            }).AsNoTracking().ToListAsync(ct);

        return [.. rows.Select(r =>
        {
            var data = ParseData(r.Data);
            return new InboxItem(r.Id, r.Title, r.Body, data.GetValueOrDefault("type") ?? "notice", data,
                r.From?.Trim() is { Length: > 0 } from ? from : null, r.CreatedAt, r.Read);
        })];
    }

    /// <summary>Legacy rows may hold any JSON; the API always returns string values (as push payloads carry).</summary>
    private static Dictionary<string, string> ParseData(string? json)
    {
        var result = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(json))
        {
            return result;
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Object)
            {
                foreach (var p in doc.RootElement.EnumerateObject())
                {
                    result[p.Name] = p.Value.ValueKind == JsonValueKind.String ? p.Value.GetString()! : p.Value.GetRawText();
                }
            }
        }
        catch (JsonException)
        {
            // Unreadable legacy data: show the notification without it.
        }

        return result;
    }

    // ---------------------------------------------------------------- sending

    private static async Task<IResult> GetAudiencesAsync(
        ClaimsPrincipal user, HttpContext http, AudienceService audiences, CancellationToken ct) =>
        ApiResponse.Ok(http, "OK", await audiences.AllowedAsync(UserId(user), Role(user), ct));

    private static async Task<IResult> SendAsync(
        SendBody body, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, AudienceService audiences, CancellationToken ct)
    {
        var title = body.Title?.Trim() ?? "";
        var text = body.Body?.Trim() ?? "";
        var errors = new Dictionary<string, string>();
        if (title.Length is 0 or > MaxTitle)
        {
            errors["title"] = $"Write a title (up to {MaxTitle} characters).";
        }

        if (text.Length is 0 or > MaxBody)
        {
            errors["body"] = $"Write the message (up to {MaxBody} characters).";
        }

        if (body.Audience?.Type is null || body.Audience.Id is null)
        {
            errors["audience"] = "Choose who should get this.";
        }

        if (errors.Count > 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Some fields need fixing.", errors);
        }

        var userId = UserId(user);
        var allowed = await audiences.AllowedAsync(userId, Role(user), ct);
        var target = allowed.FirstOrDefault(a => a.Type == body.Audience!.Type && a.Id == body.Audience.Id);
        if (target is null)
        {
            return ApiResponse.Fail(http, 403, ErrorCodes.AudienceNotAllowed, "You can't send notifications to that audience.");
        }

        if (target.Recipients == 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.EmptyAudience, $"Nobody is in {target.Label} yet.");
        }

        var id = Guid.NewGuid();
        db.Notifications.Add(new NotificationLog
        {
            Id = id,
            Title = title,
            Body = text,
            TargetType = target.Type,
            TargetId = target.Id,
            CreatedBy = userId,
            Data = JsonSerializer.Serialize(new Dictionary<string, string> { ["type"] = "notice", ["notificationId"] = id.ToString() }),
        });
        await db.SaveChangesAsync(ct);

        return ApiResponse.Ok(http, $"Sent to {target.Recipients} people.", new SendResult(id, target.Recipients), StatusCodes.Status201Created);
    }

    private static async Task<IResult> GetSentAsync(
        ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, AudienceService audiences, CancellationToken ct)
    {
        var userId = UserId(user);
        var rows = await db.Notifications.AsNoTracking()
            .Where(n => n.CreatedBy == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new
            {
                n.Id, n.Title, n.Body, n.TargetType, n.TargetId, n.Status, n.SentCount, n.FailedCount, n.CreatedAt,
                ReadCount = db.NotificationReads.Count(r => r.NotificationId == n.Id),
            }).ToListAsync(ct);

        var items = new List<SentItem>(rows.Count);
        foreach (var r in rows)
        {
            items.Add(new SentItem(r.Id, r.Title, r.Body, await audiences.LabelAsync(r.TargetType, r.TargetId, ct),
                r.Status, r.SentCount, r.FailedCount, r.ReadCount, r.CreatedAt));
        }

        return ApiResponse.Ok(http, "OK", items);
    }

    private static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);

    private static string Role(ClaimsPrincipal user) => user.FindFirstValue(TokenService.RoleClaim) ?? "";
}
