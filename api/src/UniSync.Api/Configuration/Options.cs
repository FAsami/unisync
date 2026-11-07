using System.ComponentModel.DataAnnotations;

namespace UniSync.Api.Configuration;

/// <summary>Token signing and lifetimes. JwtSecret must match the legacy Node server while both run.</summary>
public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    /// <summary>HS256 key. 32+ characters: shorter keys are rejected by the JWT library.</summary>
    [Required, MinLength(32)]
    public string JwtSecret { get; set; } = "";

    public TimeSpan AccessTokenLifetime { get; set; } = TimeSpan.FromHours(1);

    public TimeSpan RefreshTokenLifetime { get; set; } = TimeSpan.FromDays(30);
}

public sealed class OtpOptions
{
    public const string SectionName = "Otp";

    [Range(4, 8)]
    public int Length { get; set; } = 6;

    public TimeSpan Lifetime { get; set; } = TimeSpan.FromMinutes(5);

    /// <summary>Wrong guesses allowed before a code is locked.</summary>
    [Range(1, 20)]
    public int MaxAttempts { get; set; } = 5;

    /// <summary>Codes one phone number may request per rolling hour.</summary>
    [Range(1, 100)]
    public int MaxSendsPerHour { get; set; } = 3;

    [Range(4, 14)]
    public int BcryptWorkFactor { get; set; } = 10;
}

public sealed class SmsOptions
{
    public const string SectionName = "Sms";

    /// <summary>"bulksmsbd" in production; "console" (Development only) prints codes to the log.</summary>
    [Required]
    public string Provider { get; set; } = "bulksmsbd";

    public Uri Endpoint { get; set; } = new("http://118.67.213.114:3775/sendtext");

    public string? ApiKey { get; set; }

    public string? SecretKey { get; set; }

    public string? CallerId { get; set; }
}

/// <summary>Per-IP request limits. Per-phone limits live in <see cref="OtpOptions"/>.</summary>
public sealed class RateLimitOptions
{
    public const string SectionName = "RateLimits";

    public int CodeRequestsPerHourPerIp { get; set; } = 10;

    public int VerifyAttemptsPer15MinPerIp { get; set; } = 30;
}
