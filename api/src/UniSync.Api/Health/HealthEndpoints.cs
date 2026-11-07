using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Health;

public sealed record HealthStatus(string Status, string Version);

public static class HealthEndpoints
{
    public static RouteGroupBuilder MapHealthEndpoints(this RouteGroupBuilder api)
    {
        var version = typeof(HealthEndpoints).Assembly.GetName().Version?.ToString() ?? "0.0.0";

        // Liveness: the process is up. Used by the platform health check.
        api.MapGet("/health", (HttpContext http) => ApiResponse.Ok(http, "Healthy", new HealthStatus("ok", version)))
            .WithTags("Health");

        // Readiness: the database answers.
        api.MapGet("/health/ready", async (HttpContext http, UniSyncDbContext db, CancellationToken ct) =>
                await db.Database.CanConnectAsync(ct)
                    ? ApiResponse.Ok(http, "Ready", new HealthStatus("ok", version))
                    : ApiResponse.Fail(http, 503, "DATABASE_UNAVAILABLE", "The database is not reachable."))
            .WithTags("Health");

        return api;
    }
}
