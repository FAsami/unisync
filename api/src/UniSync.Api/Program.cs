using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using UniSync.Api.AccessRequests;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Configuration;
using UniSync.Api.Data;
using UniSync.Api.Academic;
using UniSync.Api.Health;
using UniSync.Api.CurrentUser;
using UniSync.Api.Notifications;
using UniSync.Api.Notifications.Push;
using UniSync.Api.Schedule;
using UniSync.Api.Setup;
using UniSync.Api.Sms;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// ---- configuration (validated at startup: a bad config fails the deploy, not a request)
services.AddOptions<AuthOptions>().BindConfiguration(AuthOptions.SectionName).ValidateDataAnnotations().ValidateOnStart();
services.AddOptions<OtpOptions>().BindConfiguration(OtpOptions.SectionName).ValidateDataAnnotations().ValidateOnStart();
services.AddOptions<RateLimitOptions>().BindConfiguration(RateLimitOptions.SectionName).ValidateDataAnnotations().ValidateOnStart();
services.AddOptions<SmsOptions>().BindConfiguration(SmsOptions.SectionName).ValidateDataAnnotations()
    .Validate(o => o.Provider is "bulksmsbd" or "console", "Sms:Provider must be 'bulksmsbd' or 'console'.")
    .Validate(o => o.Provider != "console" || builder.Environment.IsDevelopment() || builder.Environment.IsEnvironment("Testing"),
        "Sms:Provider 'console' logs sign-in codes and is only allowed in Development.")
    .Validate(o => o.Provider != "bulksmsbd" || (o.ApiKey is not null && o.SecretKey is not null && o.CallerId is not null),
        "Sms:ApiKey, Sms:SecretKey and Sms:CallerId are required for bulksmsbd.")
    .ValidateOnStart();

services.AddOptions<CampusOptions>().BindConfiguration(CampusOptions.SectionName).ValidateDataAnnotations()
    .Validate(o => TimeZoneInfo.TryFindSystemTimeZoneById(o.TimeZone, out _), "Campus:TimeZone is not a known time zone.")
    .ValidateOnStart();

services.AddSingleton(TimeProvider.System);
services.AddSingleton<CampusClock>();

// ---- data (resolved lazily so test hosts can override the connection string)
services.AddSingleton(sp =>
{
    var cs = sp.GetRequiredService<IConfiguration>().GetConnectionString("Default")
        ?? throw new InvalidOperationException("ConnectionStrings:Default is not configured.");
    return new NpgsqlDataSourceBuilder(cs).Build();
});
services.AddDbContext<UniSyncDbContext>((sp, o) =>
    o.UseNpgsql(sp.GetRequiredService<NpgsqlDataSource>()).UseSnakeCaseNamingConvention());
services.AddScoped<MigrationRunner>();

// ---- auth
services.AddScoped<TokenService>();
services.AddScoped<OtpService>();
services.AddScoped<SessionService>();
services.AddScoped<ScheduleService>();
services.AddScoped<ClassChangeService>();
services.AddScoped<AudienceService>();
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<AuthOptions>>((jwt, auth) =>
    {
        jwt.MapInboundClaims = false;
        jwt.TokenValidationParameters = TokenService.CreateValidationParameters(auth.Value);
        jwt.Events = new BearerEvents();
    });
services.AddAuthorizationBuilder().AddUniSyncPolicies();

// ---- SMS
services.AddHttpClient<BulkSmsBdSender>(c => c.Timeout = TimeSpan.FromSeconds(15));
services.AddSingleton<ConsoleSmsSender>();
services.AddScoped<ISmsSender>(sp => sp.GetRequiredService<IOptions<SmsOptions>>().Value.Provider == "console"
    ? sp.GetRequiredService<ConsoleSmsSender>()
    : sp.GetRequiredService<BulkSmsBdSender>());

// ---- push delivery (notification.log -> FCM); off until the cut-over, see PushOptions
services.AddOptions<PushOptions>().BindConfiguration(PushOptions.SectionName).ValidateDataAnnotations()
    .Validate(o => !o.Enabled || builder.Environment.IsDevelopment() || builder.Environment.IsEnvironment("Testing") || FcmCredentialsLoad(o),
        "Push:Enabled needs a valid Firebase service-account key in Push:FcmServiceAccountJson (JSON or base64).")
    .ValidateOnStart();
services.AddHttpClient<FcmPushSender>(c => c.Timeout = TimeSpan.FromSeconds(15));
services.AddSingleton<LogPushSender>();
services.AddScoped<IPushSender>(sp => sp.GetRequiredService<IOptions<PushOptions>>().Value.ServiceAccountJson() is null
    ? sp.GetRequiredService<LogPushSender>()
    : sp.GetRequiredService<FcmPushSender>());
services.AddHostedService<PushDispatcher>();

// ---- cross-cutting
services.AddExceptionHandler<EnvelopeExceptionHandler>();
services.AddProblemDetails();
services.AddOpenApi();
services.Configure<ForwardedHeadersOptions>(o =>
{
    // Fly.io terminates TLS at one proxy hop; trust exactly that hop so
    // per-IP limits see the real client and clients can't spoof their IP.
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.ForwardLimit = 1;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});
services.AddRateLimiter(o =>
{
    o.OnRejected = (ctx, _) => new ValueTask(ApiResponse.WriteFailAsync(ctx.HttpContext, StatusCodes.Status429TooManyRequests,
        ErrorCodes.RateLimited, "Too many requests. Please wait and try again."));
    o.AddPolicy(AuthEndpoints.CodePolicy, http => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp.For(http),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = http.RequestServices.GetRequiredService<IOptions<RateLimitOptions>>().Value.CodeRequestsPerHourPerIp,
            Window = TimeSpan.FromHours(1),
        }));
    o.AddPolicy(NotificationEndpoints.SendPolicy, http => RateLimitPartition.GetFixedWindowLimiter(
        http.User.FindFirst(TokenService.UserIdClaim)?.Value ?? ClientIp.For(http),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = http.RequestServices.GetRequiredService<IOptions<RateLimitOptions>>().Value.NotificationsPerHourPerUser,
            Window = TimeSpan.FromHours(1),
        }));
    o.AddPolicy(ClassChangeEndpoints.Policy, http => RateLimitPartition.GetFixedWindowLimiter(
        http.User.FindFirst(TokenService.UserIdClaim)?.Value ?? ClientIp.For(http),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = http.RequestServices.GetRequiredService<IOptions<RateLimitOptions>>().Value.ClassChangesPerHourPerUser,
            Window = TimeSpan.FromHours(1),
        }));
    o.AddPolicy(AuthEndpoints.VerifyPolicy, http => RateLimitPartition.GetFixedWindowLimiter(
        ClientIp.For(http),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = http.RequestServices.GetRequiredService<IOptions<RateLimitOptions>>().Value.VerifyAttemptsPer15MinPerIp,
            Window = TimeSpan.FromMinutes(15),
        }));
});

var app = builder.Build();

// `dotnet UniSync.Api.dll migrate` applies pending schema changes and exits
// (wire it as Fly's release_command so it runs once per deploy).
if (args.Contains("migrate"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var applied = await scope.ServiceProvider.GetRequiredService<MigrationRunner>().ApplyPendingAsync();
    Console.WriteLine(applied.Count == 0 ? "Database is up to date." : $"Applied: {string.Join(", ", applied)}");
    return;
}

// `dotnet UniSync.Api.dll create-admin --phone ... --department-code ...` creates the first department admin.
if (args.Contains(AdminBootstrap.Command))
{
    var result = await AdminBootstrap.RunAsync(app.Services, args);
    Console.WriteLine(result.Message);
    Environment.ExitCode = result.Ok ? 0 : 1;
    return;
}

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages(ctx => ctx.HttpContext.Response.HasStarted
    ? Task.CompletedTask
    : ApiResponse.WriteFailAsync(ctx.HttpContext, ctx.HttpContext.Response.StatusCode,
        ctx.HttpContext.Response.StatusCode == 404 ? ErrorCodes.NotFound : ErrorCodes.InvalidRequest,
        ctx.HttpContext.Response.StatusCode == 404 ? "Not found." : "The request could not be processed."));
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter(); // after auth, so per-user limits can partition by the signed-in user

app.MapOpenApi("/openapi/{documentName}.json");

var api = app.MapGroup("/api/v1");
api.MapHealthEndpoints();
api.MapAuthEndpoints();
api.MapMeEndpoints();
api.MapDirectoryEndpoints();
api.MapAccessRequestEndpoints();
api.MapScheduleEndpoints();
api.MapClassChangeEndpoints();
api.MapNotificationEndpoints();
api.MapDeviceEndpoints();
api.MapSetupEndpoints();

await app.RunAsync();

static bool FcmCredentialsLoad(PushOptions options)
{
    try
    {
        _ = FcmPushSender.Load(options);
        return true;
    }
    catch (Exception ex) when (ex is InvalidOperationException or ArgumentException or FormatException or System.Text.Json.JsonException or Newtonsoft.Json.JsonException)
    {
        return false;
    }
}

/// <summary>Entry point; public so integration tests can host the app.</summary>
public partial class Program;
