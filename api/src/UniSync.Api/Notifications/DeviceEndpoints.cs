using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Notifications;

public sealed record DeviceBody(string? DeviceId, string? Token, string? Platform);

/// <summary>Push tokens. A token belongs to one person at a time.</summary>
public static class DeviceEndpoints
{
    private static readonly string[] Platforms = ["android", "ios", "web"];

    public static RouteGroupBuilder MapDeviceEndpoints(this RouteGroupBuilder api)
    {
        var devices = api.MapGroup("/me/devices").WithTags("Devices").RequireAuthorization();
        devices.MapPut("/", RegisterAsync).Returns<object>();
        devices.MapDelete("/{deviceId}", (string deviceId, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, CancellationToken ct) =>
            DeactivateAsync(deviceId, user, http, db, ct)).Returns<object>();
        return api;
    }

    private static async Task<IResult> RegisterAsync(
        DeviceBody body, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var deviceId = body.DeviceId?.Trim() ?? "";
        var token = body.Token?.Trim() ?? "";
        var platform = body.Platform?.Trim().ToLowerInvariant() ?? "";
        var errors = new Dictionary<string, string>();
        if (deviceId.Length is 0 or > 200)
        {
            errors["deviceId"] = "Send a stable per-install device id.";
        }

        if (token.Length is 0 or > 4096)
        {
            errors["token"] = "Send the push token.";
        }

        if (!Platforms.Contains(platform))
        {
            errors["platform"] = "platform must be android, ios or web.";
        }

        if (errors.Count > 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Some fields need fixing.", errors);
        }

        var userId = UserId(user);
        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        // The phone changed hands (or someone signed out without cleaning up):
        // the previous person must stop receiving this phone's pushes.
        await db.Devices.Where(d => d.Token == token && d.UserId != userId).ExecuteDeleteAsync(ct);

        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO "user".device (id, user_id, device_id, provider, token, platform, is_active, last_used_at)
            VALUES (gen_random_uuid(), {userId}, {deviceId}, 'fcm', {token}, {platform}, true, now())
            ON CONFLICT (user_id, device_id, provider) DO UPDATE SET
                token = EXCLUDED.token, platform = EXCLUDED.platform, is_active = true,
                last_used_at = now(), updated_at = now()
            """, ct);
        await transaction.CommitAsync(ct);

        return ApiResponse.Ok<object?>(http, "Device registered", null);
    }

    internal static async Task<IResult> DeactivateAsync(
        string deviceId, ClaimsPrincipal user, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        await DeactivateAsync(UserId(user), deviceId, db, ct);
        return ApiResponse.Ok<object?>(http, "Device removed", null);
    }

    /// <summary>Stops pushes to one of the user's devices. Idempotent.</summary>
    public static Task<int> DeactivateAsync(Guid userId, string deviceId, UniSyncDbContext db, CancellationToken ct) =>
        db.Devices.Where(d => d.UserId == userId && d.DeviceId == deviceId)
            .ExecuteUpdateAsync(s => s.SetProperty(d => d.IsActive, false), ct);

    private static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);
}
