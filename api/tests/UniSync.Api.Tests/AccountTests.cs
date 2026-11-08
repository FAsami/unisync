using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>Account self-service: /me for every role, and in-app account deletion.</summary>
[Collection(DatabaseTests.Name)]
public sealed class AccountTests(PostgresFixture db) : ApiTestBase(db)
{
    private async Task<(HttpStatusCode Status, JsonElement Body)> DeleteMeAsync(string? bearer)
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, "/api/v1/me");
        if (bearer is not null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        }

        using var response = await Client.SendAsync(request, Ct);
        return (response.StatusCode, await response.Content.ReadFromJsonAsync<JsonElement>(Ct));
    }

    private async Task<HttpStatusCode> PutDeviceAsync(string bearer, string deviceId)
    {
        using var request = new HttpRequestMessage(HttpMethod.Put, "/api/v1/me/devices")
        {
            Content = JsonContent.Create(new { deviceId, token = "tok-" + deviceId, platform = "android" }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        using var response = await Client.SendAsync(request, Ct);
        return response.StatusCode;
    }

    [Fact]
    public async Task Deleting_my_account_signs_me_out_everywhere_and_stops_pushes()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var phone = await SignInAsync(student.Phone);
        var laptop = await SignInAsync(student.Phone);
        var access = phone.GetProperty("accessToken").GetString()!;
        Assert.Equal(HttpStatusCode.OK, await PutDeviceAsync(access, "install-" + Guid.NewGuid().ToString("N")));

        var (status, body) = await DeleteMeAsync(access);

        Assert.Equal(HttpStatusCode.OK, status);
        Assert.True(body.GetProperty("success").GetBoolean());
        Assert.True(body.GetProperty("data").TryGetProperty("deletedAt", out _));

        // Both sessions are dead at once, not at token expiry.
        Assert.Equal(HttpStatusCode.Unauthorized, (await GetAsync("/api/v1/me", access)).Status);
        Assert.Equal(HttpStatusCode.Unauthorized, (await GetAsync("/api/v1/me", laptop.GetProperty("accessToken").GetString())).Status);
        var (refresh, refreshBody) = await PostAsync("/api/v1/auth/refresh", new { refreshToken = laptop.GetProperty("refreshToken").GetString() });
        Assert.Equal(HttpStatusCode.Unauthorized, refresh);
        Assert.Equal("SESSION_REVOKED", ErrorCode(refreshBody));

        Assert.Equal(0L, await Seed.ScalarAsync<long>(Db.ConnectionString,
            """SELECT count(*) FROM "user".device WHERE user_id = @u AND is_active""", Ct, ("u", student.UserId)));
        Assert.Equal(0L, await Seed.ScalarAsync<long>(Db.ConnectionString,
            """SELECT count(*) FROM "user".session WHERE user_id = @u AND NOT revoked""", Ct, ("u", student.UserId)));

        // A deleted account can't sign back in; the roster record is kept (soft delete).
        var (code, codeBody) = await PostAsync("/api/v1/auth/code", new { phone = student.Phone });
        Assert.Equal(HttpStatusCode.NotFound, code);
        Assert.Equal("PHONE_NOT_REGISTERED", ErrorCode(codeBody));
        Assert.Equal(1L, await Seed.ScalarAsync<long>(Db.ConnectionString,
            """SELECT count(*) FROM "user".profile WHERE user_id = @u""", Ct, ("u", student.UserId)));
    }

    [Fact]
    public async Task Deleting_needs_a_signed_in_person()
    {
        var (status, body) = await DeleteMeAsync(null);
        Assert.Equal(HttpStatusCode.Unauthorized, status);
        Assert.False(body.GetProperty("success").GetBoolean());
    }

    [Fact]
    public async Task A_teacher_sees_their_own_name_on_me()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var (_, teacherPhone) = await Seed.TeacherAsync(Db.ConnectionString, placement.BatchId, "Nusrat", "Jahan", Ct);

        var (status, body) = await GetAsync("/api/v1/me", await AccessTokenAsync(teacherPhone));

        Assert.Equal(HttpStatusCode.OK, status);
        var me = body.GetProperty("data");
        Assert.Equal("teacher", me.GetProperty("role").GetString());
        Assert.Equal("Nusrat", me.GetProperty("firstName").GetString());
        Assert.Equal("Jahan", me.GetProperty("lastName").GetString());
    }
}
