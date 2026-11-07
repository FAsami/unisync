using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using UniSync.Api.Sms;

namespace UniSync.Api.Tests.Infrastructure;

/// <summary>The real app, pointed at the test database, with SMS captured in memory.</summary>
public sealed class ApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    public const string JwtSecret = "test-secret-that-is-at-least-32-characters-long";

    public FakeSmsSender Sms { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Default", connectionString);
        builder.UseSetting("Auth:JwtSecret", JwtSecret);
        builder.UseSetting("Otp:BcryptWorkFactor", "4");
        builder.UseSetting("Sms:Provider", "console");
        builder.UseSetting("RateLimits:CodeRequestsPerHourPerIp", "10000");
        builder.UseSetting("RateLimits:VerifyAttemptsPer15MinPerIp", "10000");
        builder.ConfigureTestServices(services => services.AddSingleton<ISmsSender>(Sms));
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
