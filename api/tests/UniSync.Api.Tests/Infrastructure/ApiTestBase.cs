using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace UniSync.Api.Tests.Infrastructure;

/// <summary>Shared plumbing for integration tests: the app, an HTTP client, and sign-in.</summary>
public abstract class ApiTestBase : IDisposable
{
    protected PostgresFixture Db { get; }
    protected ApiFactory Factory { get; }
    protected HttpClient Client { get; }

    protected ApiTestBase(PostgresFixture db)
    {
        Db = db;
        Assert.SkipWhen(db.Unavailable, "Set UNISYNC_TEST_DB to run database tests.");
        Factory = new ApiFactory(db.ConnectionString);
        Client = Factory.CreateClient();
    }

    public void Dispose()
    {
        Client?.Dispose();
        Factory?.Dispose();
        GC.SuppressFinalize(this);
    }

    protected static CancellationToken Ct => TestContext.Current.CancellationToken;

    protected Task<(HttpStatusCode Status, JsonElement Body)> PostAsync(string path, object? body, string? bearer = null) =>
        SendAsync(HttpMethod.Post, path, body ?? new { }, bearer);

    protected Task<(HttpStatusCode Status, JsonElement Body)> GetAsync(string path, string? bearer = null) =>
        SendAsync(HttpMethod.Get, path, null, bearer);

    private async Task<(HttpStatusCode Status, JsonElement Body)> SendAsync(HttpMethod method, string path, object? body, string? bearer)
    {
        using var request = new HttpRequestMessage(method, path);
        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        if (bearer is not null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        }

        using var response = await Client.SendAsync(request, Ct);
        return (response.StatusCode, await response.Content.ReadFromJsonAsync<JsonElement>(Ct));
    }

    protected static string ErrorCode(JsonElement body) => body.GetProperty("error").GetProperty("code").GetString()!;

    /// <summary>Signs in through the real code flow and returns the token payload.</summary>
    protected async Task<JsonElement> SignInAsync(string phone)
    {
        var (status, _) = await PostAsync("/api/v1/auth/code", new { phone });
        Assert.Equal(HttpStatusCode.OK, status);
        var (verified, body) = await PostAsync("/api/v1/auth/verify", new { phone, code = Factory.Sms.LastCodeFor(phone) });
        Assert.Equal(HttpStatusCode.OK, verified);
        return body.GetProperty("data");
    }

    protected async Task<string> AccessTokenAsync(string phone) =>
        (await SignInAsync(phone)).GetProperty("accessToken").GetString()!;
}
