using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using UniSync.Api.Common;
using UniSync.Api.Configuration;
using UniSync.Api.Notifications.Push;
using UniSync.Api.Sms;

namespace UniSync.Api.Tests.Infrastructure;

/// <summary>The real app, pointed at the test database, with SMS captured in memory.</summary>
public sealed class ApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    public const string JwtSecret = "test-secret-that-is-at-least-32-characters-long";

    public FakeSmsSender Sms { get; } = new();

    public FakePushSender Push { get; } = new();

    /// <summary>Campus "now" for schedule tests. Token lifetimes keep using the real clock.</summary>
    public SettableTimeProvider CampusTime { get; } = new(DateTimeOffset.UtcNow);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Default", connectionString);
        builder.UseSetting("Auth:JwtSecret", JwtSecret);
        builder.UseSetting("Otp:BcryptWorkFactor", "4");
        builder.UseSetting("Sms:Provider", "console");
        builder.UseSetting("RateLimits:CodeRequestsPerHourPerIp", "10000");
        builder.UseSetting("RateLimits:VerifyAttemptsPer15MinPerIp", "10000");
        builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<ISmsSender>(Sms);
            services.AddSingleton<IPushSender>(Push);
            // Tests drive delivery themselves (DeliverPendingAsync), never a background loop.
            var loop = services.Single(d => d.ServiceType == typeof(IHostedService) && d.ImplementationType == typeof(PushDispatcher));
            services.Remove(loop);
            services.AddSingleton<PushDispatcher>();
            services.AddSingleton(sp => new CampusClock(CampusTime, sp.GetRequiredService<IOptions<CampusOptions>>()));
        });
    }
}

public sealed partial class FakeSmsSender : ISmsSender
{
    private readonly ConcurrentQueue<(string Phone, string Message)> _sent = new();

    public IReadOnlyList<(string Phone, string Message)> Sent => [.. _sent];

    public Task SendAsync(string phoneE164, string message, CancellationToken cancellationToken)
    {
        _sent.Enqueue((phoneE164, message));
        return Task.CompletedTask;
    }

    public string LastCodeFor(string phoneE164)
    {
        var message = _sent.Reverse().First(m => m.Phone == phoneE164).Message;
        return LeadingCode().Match(message).Value;
    }

    [GeneratedRegex(@"^\d+")]
    private static partial Regex LeadingCode();
}

/// <summary>Records pushes. Tokens listed in <see cref="DeadTokens"/> answer InvalidToken, in <see cref="FailingTokens"/> Failed.</summary>
public sealed class FakePushSender : IPushSender
{
    private readonly ConcurrentQueue<(string Token, PushMessage Message)> _sent = new();

    public ConcurrentDictionary<string, bool> DeadTokens { get; } = new();

    public ConcurrentDictionary<string, bool> FailingTokens { get; } = new();

    /// <summary>Per-send delay, to make concurrent dispatchers overlap.</summary>
    public TimeSpan Delay { get; set; }

    public IReadOnlyList<(string Token, PushMessage Message)> Sent => [.. _sent];

    public async Task<PushResult> SendAsync(string token, PushMessage message, CancellationToken cancellationToken)
    {
        if (Delay > TimeSpan.Zero)
        {
            await Task.Delay(Delay, cancellationToken);
        }

        if (DeadTokens.ContainsKey(token))
        {
            return new PushResult(PushOutcome.InvalidToken, "FCM 404 UNREGISTERED");
        }

        if (FailingTokens.ContainsKey(token))
        {
            return new PushResult(PushOutcome.Failed, "FCM 503 UNAVAILABLE");
        }

        _sent.Enqueue((token, message));
        return new PushResult(PushOutcome.Sent);
    }
}

public sealed class SettableTimeProvider(DateTimeOffset now) : TimeProvider
{
    public DateTimeOffset Now { get; set; } = now;

    public override DateTimeOffset GetUtcNow() => Now.ToUniversalTime();
}
