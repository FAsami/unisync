using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using UniSync.Api.Data;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

[Collection(DatabaseTests.Name)]
public sealed class AuthFlowTests(PostgresFixture db) : ApiTestBase(db)
{
    [Fact]
    public async Task Health_returns_the_standard_envelope()
    {
        var (status, body) = await GetAsync("/api/v1/health");
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.True(body.GetProperty("success").GetBoolean());
        Assert.Equal("ok", body.GetProperty("data").GetProperty("status").GetString());
        Assert.Equal(HttpStatusCode.OK, (await GetAsync("/api/v1/health/ready")).Status);
    }

    [Fact]
    public async Task A_rostered_student_signs_in_with_a_local_format_number()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var local = "0" + student.Phone[4..]; // +8801712345678 -> 01712345678

        var (status, body) = await PostAsync("/api/v1/auth/code", new { phone = local });
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Equal(student.Phone, body.GetProperty("data").GetProperty("phone").GetString());

        var code = Factory.Sms.LastCodeFor(student.Phone);
        Assert.Matches("^[0-9]{6}$", code);

        var (verified, session) = await PostAsync("/api/v1/auth/verify", new { phone = local, code });
        Assert.Equal(HttpStatusCode.OK, verified);
        var data = session.GetProperty("data");
        Assert.Equal("student", data.GetProperty("role").GetString());

        // The session row is stored under the same id the tokens carry.
        var sessionId = data.GetProperty("sessionId").GetGuid();
        var stored = await Seed.ScalarAsync<string>(Db.ConnectionString,
            """SELECT access_token FROM "user".session WHERE id = @id""", Ct, ("id", sessionId));
        Assert.Equal(data.GetProperty("accessToken").GetString(), stored);

        var verifiedAt = await Seed.ScalarAsync<object>(Db.ConnectionString,
            """SELECT phone_verified_at FROM "user".account WHERE id = @id""", Ct, ("id", student.UserId));
        Assert.IsType<DateTime>(verifiedAt);
    }

    [Fact]
    public async Task An_unrostered_number_gets_a_clear_answer_and_no_sms()
    {
        var phone = Seed.RandomPhone();
        var (status, body) = await PostAsync("/api/v1/auth/code", new { phone });
        Assert.Equal(HttpStatusCode.NotFound, status);
        Assert.Equal("PHONE_NOT_REGISTERED", ErrorCode(body));
        Assert.DoesNotContain(Factory.Sms.Sent, m => m.Phone == phone);
    }

    [Fact]
    public async Task An_invalid_number_is_rejected_before_anything_else()
    {
        var (status, body) = await PostAsync("/api/v1/auth/code", new { phone = "12345" });
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("INVALID_PHONE", ErrorCode(body));
    }

    [Fact]
    public async Task Wrong_codes_count_down_and_then_lock_the_code()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        await PostAsync("/api/v1/auth/code", new { phone = student.Phone });
        var right = Factory.Sms.LastCodeFor(student.Phone);
        var wrong = right == "000000" ? "111111" : "000000";

        for (var remaining = 4; remaining >= 0; remaining--)
        {
            var (status, body) = await PostAsync("/api/v1/auth/verify", new { phone = student.Phone, code = wrong });
            Assert.Equal(HttpStatusCode.BadRequest, status);
            Assert.Equal(remaining, body.GetProperty("error").GetProperty("details").GetProperty("attemptsRemaining").GetInt32());
        }

        var (locked, lockedBody) = await PostAsync("/api/v1/auth/verify", new { phone = student.Phone, code = right });
        Assert.Equal(HttpStatusCode.BadRequest, locked);
        Assert.Equal("TOO_MANY_ATTEMPTS", ErrorCode(lockedBody));
    }

    [Fact]
    public async Task A_code_works_only_once()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        await SignInAsync(student.Phone);
        var code = Factory.Sms.LastCodeFor(student.Phone);

        var (status, body) = await PostAsync("/api/v1/auth/verify", new { phone = student.Phone, code });
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("INVALID_CODE", ErrorCode(body));
    }

    [Fact]
    public async Task Requesting_a_new_code_retires_the_previous_one()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        await PostAsync("/api/v1/auth/code", new { phone = student.Phone });
        var first = Factory.Sms.LastCodeFor(student.Phone);
        await PostAsync("/api/v1/auth/code", new { phone = student.Phone });
        var second = Factory.Sms.LastCodeFor(student.Phone);

        if (first != second)
        {
            var (status, _) = await PostAsync("/api/v1/auth/verify", new { phone = student.Phone, code = first });
            Assert.Equal(HttpStatusCode.BadRequest, status);
        }

        var (ok, _) = await PostAsync("/api/v1/auth/verify", new { phone = student.Phone, code = second });
        Assert.Equal(HttpStatusCode.OK, ok);
    }

    [Fact]
    public async Task A_phone_gets_at_most_three_codes_an_hour()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        for (var i = 0; i < 3; i++)
        {
            Assert.Equal(HttpStatusCode.OK, (await PostAsync("/api/v1/auth/code", new { phone = student.Phone })).Status);
        }

        var (status, body) = await PostAsync("/api/v1/auth/code", new { phone = student.Phone });
        Assert.Equal(HttpStatusCode.TooManyRequests, status);
        Assert.Equal("TOO_MANY_CODES", ErrorCode(body));
        Assert.Equal(3, Factory.Sms.Sent.Count(m => m.Phone == student.Phone));
    }

    [Fact]
    public async Task Me_returns_the_profile_and_cr_mark()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var tokens = await SignInAsync(student.Phone);
        var access = tokens.GetProperty("accessToken").GetString();

        var (status, body) = await GetAsync("/api/v1/me", access);
        Assert.Equal(HttpStatusCode.OK, status);
        var me = body.GetProperty("data");
        Assert.Equal("Ada", me.GetProperty("firstName").GetString());
        Assert.Equal("A", me.GetProperty("section").GetProperty("name").GetString());
        Assert.False(me.GetProperty("isClassRepresentative").GetBoolean());

        await Seed.ExecuteAsync(Db.ConnectionString,
            "INSERT INTO academic.class_representative (user_id, section_id, batch_id) VALUES (@u, @s, @b)", Ct,
            ("u", student.UserId), ("s", student.SectionId), ("b", student.BatchId));

        var (_, after) = await GetAsync("/api/v1/me", access);
        Assert.True(after.GetProperty("data").GetProperty("isClassRepresentative").GetBoolean());
    }

    [Fact]
    public async Task Refresh_rotates_tokens_and_a_replayed_refresh_token_ends_the_session()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var tokens = await SignInAsync(student.Phone);
        var firstRefresh = tokens.GetProperty("refreshToken").GetString();

        var (status, body) = await PostAsync("/api/v1/auth/refresh", new { refreshToken = firstRefresh });
        Assert.Equal(HttpStatusCode.OK, status);
        var rotated = body.GetProperty("data");
        Assert.Equal(tokens.GetProperty("sessionId").GetGuid(), rotated.GetProperty("sessionId").GetGuid());
        Assert.NotEqual(firstRefresh, rotated.GetProperty("refreshToken").GetString());

        // Replaying the old refresh token = treated as stolen: the session is revoked.
        var (replayed, replayBody) = await PostAsync("/api/v1/auth/refresh", new { refreshToken = firstRefresh });
        Assert.Equal(HttpStatusCode.Unauthorized, replayed);
        Assert.Equal("SESSION_REVOKED", ErrorCode(replayBody));

        var (me, meBody) = await GetAsync("/api/v1/me", rotated.GetProperty("accessToken").GetString());
        Assert.Equal(HttpStatusCode.Unauthorized, me);
        Assert.Equal("SESSION_REVOKED", ErrorCode(meBody));
    }

    [Fact]
    public async Task A_refresh_token_is_not_an_access_token()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var tokens = await SignInAsync(student.Phone);

        var (status, body) = await GetAsync("/api/v1/me", tokens.GetProperty("refreshToken").GetString());
        Assert.Equal(HttpStatusCode.Unauthorized, status);
        Assert.False(body.GetProperty("success").GetBoolean());
    }

    [Fact]
    public async Task Logout_takes_effect_immediately()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var access = (await SignInAsync(student.Phone)).GetProperty("accessToken").GetString();

        var (status, _) = await PostAsync("/api/v1/auth/logout", new { }, access);
        Assert.Equal(HttpStatusCode.OK, status);

        var (me, body) = await GetAsync("/api/v1/me", access);
        Assert.Equal(HttpStatusCode.Unauthorized, me);
        Assert.Equal("SESSION_REVOKED", ErrorCode(body));
    }

    [Fact]
    public async Task A_deleted_account_loses_access_at_once()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var tokens = await SignInAsync(student.Phone);

        await Seed.ExecuteAsync(Db.ConnectionString,
            """UPDATE "user".account SET deleted_at = now(), is_active = false WHERE id = @id""", Ct, ("id", student.UserId));

        Assert.Equal(HttpStatusCode.Unauthorized, (await GetAsync("/api/v1/me", tokens.GetProperty("accessToken").GetString())).Status);
        Assert.Equal(HttpStatusCode.Unauthorized, (await PostAsync("/api/v1/auth/refresh", new { refreshToken = tokens.GetProperty("refreshToken").GetString() })).Status);
        Assert.Equal("PHONE_NOT_REGISTERED", ErrorCode((await PostAsync("/api/v1/auth/code", new { phone = student.Phone })).Body));
    }

    [Fact]
    public async Task Requests_without_a_token_get_the_envelope_not_a_bare_401()
    {
        var (status, body) = await GetAsync("/api/v1/me");
        Assert.Equal(HttpStatusCode.Unauthorized, status);
        Assert.Equal("UNAUTHORIZED", ErrorCode(body));
    }

    [Fact]
    public async Task Unknown_routes_and_malformed_json_use_the_envelope()
    {
        var (missing, missingBody) = await GetAsync("/api/v1/nope");
        Assert.Equal(HttpStatusCode.NotFound, missing);
        Assert.Equal("NOT_FOUND", ErrorCode(missingBody));

        using var content = new StringContent("{not json", Encoding.UTF8, "application/json");
        using var response = await Client.PostAsync(new Uri("/api/v1/auth/code", UriKind.Relative), content, Ct);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(Ct);
        Assert.Equal("INVALID_REQUEST", ErrorCode(body));
    }

    [Fact]
    public async Task Migrations_are_idempotent()
    {
        await using var dataSource = NpgsqlDataSource.Create(Db.ConnectionString);
        var applied = await new MigrationRunner(dataSource, NullLogger<MigrationRunner>.Instance).ApplyPendingAsync(Ct);
        Assert.Empty(applied);
    }
}
