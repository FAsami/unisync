using System.Globalization;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using UniSync.Api.Common;
using UniSync.Api.Configuration;
using UniSync.Api.Data;

namespace UniSync.Api.Auth;

public sealed record OtpCheckResult(bool Ok, string? ErrorCode = null, string? Message = null, int? AttemptsRemaining = null)
{
    public static readonly OtpCheckResult Success = new(true);
}

/// <summary>
/// The only place one-time codes are created and checked. Every check enforces
/// expiry and the attempt limit and consumes the code atomically, so a code can
/// be neither brute-forced nor replayed.
/// </summary>
public sealed class OtpService(UniSyncDbContext db, IOptions<OtpOptions> options, TimeProvider time)
{
    public const string SignInPurpose = "LOGIN";

    public async Task<bool> SendLimitReachedAsync(string phone, string purpose, CancellationToken ct)
    {
        var since = time.GetUtcNow().AddHours(-1);
        var sent = await db.OtpTransactions.CountAsync(
            o => o.Identifier == phone && o.Purpose == purpose && o.CreatedAt > since, ct);
        return sent >= options.Value.MaxSendsPerHour;
    }

    /// <summary>Creates a fresh code (expiring any earlier live one) and returns it in plain text for sending.</summary>
    public async Task<string> CreateAsync(string phone, string purpose, CancellationToken ct)
    {
        var o = options.Value;
        var now = time.GetUtcNow();

        await db.OtpTransactions
            .Where(x => x.Identifier == phone && x.Purpose == purpose && !x.Verified && x.ExpiresAt > now)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.ExpiresAt, now), ct);

        var max = (int)Math.Pow(10, o.Length);
        var code = RandomNumberGenerator.GetInt32(0, max).ToString(new string('0', o.Length), CultureInfo.InvariantCulture);

        db.OtpTransactions.Add(new OtpTransaction
        {
            Identifier = phone,
            IdentifierType = "PHONE",
            Purpose = purpose,
            OtpHash = BCrypt.Net.BCrypt.HashPassword(code, o.BcryptWorkFactor),
            ExpiresAt = now + o.Lifetime,
        });
        await db.SaveChangesAsync(ct);
        return code;
    }

    public async Task<OtpCheckResult> CheckAndConsumeAsync(string phone, string purpose, string code, CancellationToken ct)
    {
        var o = options.Value;
        var now = time.GetUtcNow();

        var record = await db.OtpTransactions.AsNoTracking()
            .Where(x => x.Identifier == phone && x.Purpose == purpose && !x.Verified)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (record is null)
        {
            return new(false, ErrorCodes.InvalidCode, "That code is not valid. Request a new one.");
        }

        if (record.ExpiresAt <= now)
        {
            return new(false, ErrorCodes.CodeExpired, "That code has expired. Request a new one.");
        }

        if (record.Attempts >= o.MaxAttempts)
        {
            return new(false, ErrorCodes.TooManyAttempts, "Too many wrong attempts. Request a new code.");
        }

        if (!BCrypt.Net.BCrypt.Verify(code, record.OtpHash))
        {
            // Atomic increment guarded by the limit, so parallel guesses can't exceed it.
            await db.OtpTransactions
                .Where(x => x.Id == record.Id && x.Attempts < o.MaxAttempts)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Attempts, x => x.Attempts + 1), ct);
            var remaining = Math.Max(0, o.MaxAttempts - (record.Attempts + 1));
            return new(false, ErrorCodes.InvalidCode, "That code is not correct.", remaining);
        }

        // Only one request can flip verified false -> true: that one wins.
        var consumed = await db.OtpTransactions
            .Where(x => x.Id == record.Id && !x.Verified && x.ExpiresAt > now && x.Attempts < o.MaxAttempts)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.Verified, true).SetProperty(x => x.VerifiedAt, now), ct);

        return consumed == 1
            ? OtpCheckResult.Success
            : new(false, ErrorCodes.InvalidCode, "That code is not valid. Request a new one.");
    }
}
