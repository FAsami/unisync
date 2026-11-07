using UniSync.Api.Auth;

namespace UniSync.Api.Tests;

public class PhoneNumberTests
{
    [Theory]
    [InlineData("+8801712345678")]
    [InlineData("8801712345678")]
    [InlineData("01712345678")]
    [InlineData("1712345678")]
    [InlineData(" 017-1234-5678 ")]
    [InlineData("+880 1712 345678")]
    public void Common_spellings_normalise_to_e164(string input)
    {
        Assert.True(PhoneNumber.TryNormalize(input, out var e164));
        Assert.Equal("+8801712345678", e164);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("abc")]
    [InlineData("0171234567")]      // one digit short
    [InlineData("017123456789")]    // one digit long
    [InlineData("01212345678")]     // operator digit 2 does not exist
    [InlineData("+14155552671")]    // another country
    [InlineData("01712345678x")]
    public void Anything_else_is_rejected(string? input)
    {
        Assert.False(PhoneNumber.TryNormalize(input, out _));
    }
}
