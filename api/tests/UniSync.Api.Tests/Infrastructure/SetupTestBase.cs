using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace UniSync.Api.Tests.Infrastructure;

/// <summary>Department setup tests: a fresh department with a signed-in admin, plus any-verb requests.</summary>
public abstract class SetupTestBase(PostgresFixture db) : ApiTestBase(db)
{
    /// <summary>A department ("2026" batch, section "A") and its admin's access token.</summary>
    protected async Task<(SeededPlacement Placement, string Admin)> DepartmentAsync()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AccessTokenAsync(await Seed.AdminAsync(Db.ConnectionString, placement.DepartmentId, Ct));
        return (placement, admin);
    }

    protected Task<(HttpStatusCode Status, JsonElement Body)> PatchAsync(string path, object body, string bearer) =>
        RequestAsync(HttpMethod.Patch, path, body, bearer);

    protected Task<(HttpStatusCode Status, JsonElement Body)> PutAsync(string path, object? body, string bearer) =>
        RequestAsync(HttpMethod.Put, path, body ?? new { }, bearer);

    protected Task<(HttpStatusCode Status, JsonElement Body)> DeleteAsync(string path, string bearer) =>
        RequestAsync(HttpMethod.Delete, path, null, bearer);

    protected async Task<(HttpStatusCode Status, JsonElement Body)> RequestAsync(HttpMethod method, string path, object? body, string? bearer)
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

    /// <summary>Asserts a 2xx envelope and returns its data.</summary>
    protected static JsonElement Ok((HttpStatusCode Status, JsonElement Body) result, HttpStatusCode expected = HttpStatusCode.OK)
    {
        Assert.True(result.Status == expected, $"Expected {expected}, got {result.Status}: {result.Body}");
        Assert.True(result.Body.GetProperty("success").GetBoolean());
        return result.Body.GetProperty("data");
    }

    /// <summary>Asserts a failure envelope with this status and code.</summary>
    protected static JsonElement Fails((HttpStatusCode Status, JsonElement Body) result, HttpStatusCode status, string code)
    {
        Assert.True(result.Status == status, $"Expected {status}, got {result.Status}: {result.Body}");
        Assert.Equal(code, ErrorCode(result.Body));
        return result.Body.GetProperty("error");
    }

    protected Task<long> CountAsync(string sql, params (string Name, object Value)[] parameters) =>
        Seed.ScalarAsync<long>(Db.ConnectionString, sql, Ct, parameters);
}
