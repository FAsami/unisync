namespace UniSync.Api.Auth;

/// <summary>
/// Bangladeshi mobile numbers in any common spelling, normalised to E.164
/// (<c>+8801XXXXXXXXX</c>), the form stored in user.account.phone.
/// Accepts <c>+8801712345678</c>, <c>8801712345678</c>, <c>01712345678</c>,
/// <c>1712345678</c>, with spaces or dashes.
/// </summary>
public static class PhoneNumber
{
    public static bool TryNormalize(string? input, out string e164)
    {
        e164 = "";
        if (string.IsNullOrWhiteSpace(input))
        {
            return false;
        }

        var trimmed = input.Trim();
        var hasPlus = trimmed.StartsWith('+');
        var body = hasPlus ? trimmed[1..] : trimmed;
        if (body.Any(c => !char.IsAsciiDigit(c) && c is not (' ' or '-')))
        {
            return false;
        }

        var digits = new string([.. body.Where(char.IsAsciiDigit)]);
        if (digits.StartsWith("880", StringComparison.Ordinal))
        {
            digits = digits[3..];
        }
        else if (hasPlus)
        {
            return false; // another country code
        }
        else if (digits.StartsWith('0'))
        {
            digits = digits[1..];
        }

        // 1 + operator digit 3–9 + 8 digits
        if (digits.Length != 10 || digits[0] != '1' || digits[1] < '3' || digits[1] > '9')
        {
            return false;
        }

        e164 = "+880" + digits;
        return true;
    }
}
