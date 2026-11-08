using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using UniSync.Api.Data;
using UniSync.Api.Notifications.Push;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>
/// Push delivery from notification.log (replacing Hasura's trigger + the Node sender).
/// The shared test database holds other tests' rows too, so every assertion is
/// scoped to this test's own notifications and device tokens.
/// </summary>
[Collection(DatabaseTests.Name)]
public sealed class PushTests(PostgresFixture db) : ApiTestBase(db)
{
    private PushDispatcher Dispatcher(bool enabled = true, Action<IWebHostBuilder>? configure = null)
    {
        var factory = Factory.WithWebHostBuilder(b =>
        {
            b.UseSetting("Push:Enabled", enabled ? "true" : "false");
            configure?.Invoke(b);
        });
        return factory.Services.GetRequiredService<PushDispatcher>();
    }

    private async Task<string> DeviceAsync(Guid userId, bool active = true)
    {
        var token = "tok-" + Guid.NewGuid().ToString("N");
        await Seed.ExecuteAsync(Db.ConnectionString, """
            INSERT INTO "user".device (id, user_id, device_id, provider, token, platform, is_active, last_used_at)
            VALUES (gen_random_uuid(), @u, @d, 'fcm', @t, 'android', @a, now())
            """, Ct, ("u", userId), ("d", "install-" + token), ("t", token), ("a", active));
        return token;
    }

    private async Task<(string Status, int Sent, int Failed, string? Error, bool Processed)> RowAsync(Guid id)
    {
        await using var connection = new Npgsql.NpgsqlConnection(Db.ConnectionString);
        await connection.OpenAsync(Ct);
        await using var command = new Npgsql.NpgsqlCommand(
            "SELECT status, sent_count, failed_count, error_message, processed_at IS NOT NULL FROM notification.log WHERE id = @id", connection);
        command.Parameters.AddWithValue("id", id);
        await using var reader = await command.ExecuteReaderAsync(Ct);
        await reader.ReadAsync(Ct);
        return (reader.GetString(0), reader.GetInt32(1), reader.GetInt32(2), reader.IsDBNull(3) ? null : reader.GetString(3), reader.GetBoolean(4));
    }

    private Task<bool?> DeviceActiveAsync(string token) =>
        Seed.ScalarAsync<bool?>(Db.ConnectionString, """SELECT is_active FROM "user".device WHERE token = @t""", Ct, ("t", token));

    private IEnumerable<(string Token, PushMessage Message)> SentFor(Guid notificationId) =>
        Factory.Push.Sent.Where(s => s.Message.Data["notificationId"] == notificationId.ToString());

    private static async Task DrainAsync(PushDispatcher dispatcher)
    {
        while (await dispatcher.DeliverPendingAsync(Ct) > 0)
        {
        }
    }

    [Fact]
    public async Task A_notice_is_pushed_to_every_device_in_its_audience_and_no_one_else()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var outsider = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var phone = await DeviceAsync(student.UserId);
        var tablet = await DeviceAsync(student.UserId);
        var oldPhone = await DeviceAsync(student.UserId, active: false);
        var outsiderPhone = await DeviceAsync(outsider.UserId);
        var id = await Seed.NotificationAsync(Db.ConnectionString, "section", student.SectionId, student.UserId, "Quiz moved", Ct);

        await DrainAsync(Dispatcher());

        var sent = SentFor(id).ToList();
        Assert.Equal(new[] { phone, tablet }.Order(StringComparer.Ordinal), sent.Select(s => s.Token).Order(StringComparer.Ordinal));
        Assert.DoesNotContain(Factory.Push.Sent, s => s.Token == oldPhone || s.Token == outsiderPhone);
        var message = sent[0].Message;
        Assert.Equal("Quiz moved", message.Title);
        Assert.Equal("Body of Quiz moved", message.Body);
        Assert.Equal("notice", message.Data["type"]);

        var row = await RowAsync(id);
        Assert.Equal(("sent", 2, 0, (string?)null, true), row);
    }

    [Fact]
    public async Task Dead_tokens_are_switched_off_and_failures_are_counted()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var good = await DeviceAsync(student.UserId);
        var dead = await DeviceAsync(student.UserId);
        var flaky = await DeviceAsync(student.UserId);
        Factory.Push.DeadTokens[dead] = true;
        Factory.Push.FailingTokens[flaky] = true;
        var id = await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, "Hello", Ct);

        await DrainAsync(Dispatcher());

        var (status, sent, failed, error, _) = await RowAsync(id);
        Assert.Equal(("sent", 1, 2), (status, sent, failed));
        Assert.Contains("FCM 503 UNAVAILABLE", error, StringComparison.Ordinal);
        Assert.Contains("1 expired device token(s) removed", error, StringComparison.Ordinal);
        Assert.False(await DeviceActiveAsync(dead));
        Assert.True(await DeviceActiveAsync(flaky)); // a temporary failure keeps the token
        Assert.True(await DeviceActiveAsync(good));
        Assert.DoesNotContain(dead, error, StringComparison.Ordinal); // never a token in the log
    }

    [Fact]
    public async Task When_every_device_fails_the_notice_is_marked_failed()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        Factory.Push.FailingTokens[await DeviceAsync(student.UserId)] = true;
        var id = await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, "Down", Ct);

        await DrainAsync(Dispatcher());

        var (status, sent, failed, _, _) = await RowAsync(id);
        Assert.Equal(("failed", 0, 1), (status, sent, failed));
    }

    [Fact]
    public async Task An_audience_without_devices_is_sent_to_the_inbox_and_an_empty_one_fails()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var noDevices = await Seed.NotificationAsync(Db.ConnectionString, "section", student.SectionId, student.UserId, "No phones", Ct);
        var nobody = await Seed.NotificationAsync(Db.ConnectionString, "section", Guid.NewGuid(), student.UserId, "Nobody", Ct);

        await DrainAsync(Dispatcher());

        Assert.Equal(("sent", 0, 0, PushDispatcher.NoDevicesMessage, true), await RowAsync(noDevices));
        Assert.Equal(("failed", 0, 0, PushDispatcher.NoUsersMessage, true), await RowAsync(nobody));
    }

    [Fact]
    public async Task Two_dispatchers_never_send_the_same_notice_twice()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var token = await DeviceAsync(student.UserId);
        var ids = new List<Guid>();
        for (var i = 0; i < 12; i++)
        {
            ids.Add(await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, $"Notice {i}", Ct));
        }

        Factory.Push.Delay = TimeSpan.FromMilliseconds(20);
        Action<IWebHostBuilder> configure = b => b.UseSetting("Push:BatchSize", "3");
        var a = Dispatcher(configure: configure);
        var b = Dispatcher(configure: configure);
        await Task.WhenAll(DrainAsync(a), DrainAsync(b), DrainAsync(a));

        foreach (var id in ids)
        {
            Assert.Single(SentFor(id), s => s.Token == token);
            Assert.Equal("sent", (await RowAsync(id)).Status);
        }
    }

    [Fact]
    public async Task A_notice_stuck_in_processing_is_picked_up_again()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var token = await DeviceAsync(student.UserId);
        var stuck = await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, "Stuck", Ct);
        var busy = await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, "Busy", Ct);
        await Seed.ExecuteAsync(Db.ConnectionString,
            "UPDATE notification.log SET status = 'processing', processed_at = now() - interval '1 hour' WHERE id = @id", Ct, ("id", stuck));
        await Seed.ExecuteAsync(Db.ConnectionString,
            "UPDATE notification.log SET status = 'processing', processed_at = now() WHERE id = @id", Ct, ("id", busy));

        await DrainAsync(Dispatcher());

        Assert.Single(SentFor(stuck), s => s.Token == token);
        Assert.Equal("sent", (await RowAsync(stuck)).Status);
        Assert.Empty(SentFor(busy)); // another instance is on it right now
        Assert.Equal("processing", (await RowAsync(busy)).Status);
    }

    [Fact]
    public async Task A_backlog_older_than_max_age_is_not_pushed()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        await DeviceAsync(student.UserId);
        var old = await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, "Yesterday", Ct,
            createdAt: DateTimeOffset.UtcNow.AddHours(-2));

        await DrainAsync(Dispatcher());

        Assert.Empty(SentFor(old));
        Assert.Equal(("failed", 0, 0, PushDispatcher.TooOldMessage, true), await RowAsync(old));
    }

    [Fact]
    public async Task Delivery_is_off_by_default_so_it_never_doubles_the_legacy_sender()
    {
        Assert.False(Factory.Services.GetRequiredService<IOptions<PushOptions>>().Value.Enabled);
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        await DeviceAsync(student.UserId);
        var id = await Seed.NotificationAsync(Db.ConnectionString, "user", student.UserId, student.UserId, "Legacy sends this", Ct);

        Assert.Equal(0, await Dispatcher(enabled: false).DeliverPendingAsync(Ct));

        Assert.Empty(SentFor(id));
        Assert.Equal("pending", (await RowAsync(id)).Status);
        await Seed.ExecuteAsync(Db.ConnectionString, "UPDATE notification.log SET status = 'sent' WHERE id = @id", Ct, ("id", id));
    }

    [Fact]
    public void Turning_delivery_on_in_production_without_a_firebase_key_fails_at_startup()
    {
        using var production = Factory.WithWebHostBuilder(b => b
            .UseEnvironment("Production")
            .UseSetting("Sms:Provider", "bulksmsbd")
            .UseSetting("Sms:ApiKey", "k").UseSetting("Sms:SecretKey", "s").UseSetting("Sms:CallerId", "c")
            .UseSetting("Push:Enabled", "true"));

        var error = Assert.Throws<OptionsValidationException>(() => production.CreateClient());
        Assert.Contains("Push:Enabled needs a valid Firebase service-account key", error.Message, StringComparison.Ordinal);
    }
}

/// <summary>Pure pieces of push delivery; no database.</summary>
public sealed class PushUnitTests
{
    [Theory]
    [InlineData(404, """{"error":{"code":404,"status":"NOT_FOUND","message":"Requested entity was not found.","details":[{"@type":"type.googleapis.com/google.firebase.fcm.v1.FcmError","errorCode":"UNREGISTERED"}]}}""", PushOutcome.InvalidToken, "FCM 404 UNREGISTERED")]
    [InlineData(403, """{"error":{"code":403,"status":"PERMISSION_DENIED","message":"SenderId mismatch","details":[{"errorCode":"SENDER_ID_MISMATCH"}]}}""", PushOutcome.InvalidToken, "FCM 403 SENDER_ID_MISMATCH")]
    [InlineData(400, """{"error":{"code":400,"status":"INVALID_ARGUMENT","message":"The registration token is not a valid FCM registration token","details":[{"errorCode":"INVALID_ARGUMENT"}]}}""", PushOutcome.InvalidToken, "FCM 400 INVALID_ARGUMENT")]
    [InlineData(400, """{"error":{"code":400,"status":"INVALID_ARGUMENT","message":"Invalid value at 'message.data'"}}""", PushOutcome.Failed, "FCM 400 INVALID_ARGUMENT")]
    [InlineData(503, """{"error":{"code":503,"status":"UNAVAILABLE","details":[{"errorCode":"UNAVAILABLE"}]}}""", PushOutcome.Failed, "FCM 503 UNAVAILABLE")]
    [InlineData(502, "<html>Bad gateway</html>", PushOutcome.Failed, "FCM 502 error")]
    public void Fcm_errors_are_classified_and_only_codes_are_kept(int status, string body, PushOutcome outcome, string error)
    {
        var result = FcmPushSender.Classify(status, body);
        Assert.Equal(outcome, result.Outcome);
        Assert.Equal(error, result.Error);
    }

    [Fact]
    public void Push_data_is_all_strings_and_always_carries_the_notification_id()
    {
        var row = new NotificationLog { Id = Guid.NewGuid(), Data = """{"type":"class_change","routineId":"r1","count":3,"flag":true,"nested":{"a":1}}""" };

        var data = PushDispatcher.DataFor(row);

        Assert.Equal("class_change", data["type"]);
        Assert.Equal("3", data["count"]);
        Assert.Equal("true", data["flag"]);
        Assert.Equal("""{"a":1}""", data["nested"]);
        Assert.Equal(row.Id.ToString(), data["notificationId"]);
        Assert.Equal(row.Id.ToString(), PushDispatcher.DataFor(new NotificationLog { Id = row.Id, Data = "not json" })["notificationId"]);
    }

    [Fact]
    public void The_service_account_key_is_accepted_as_json_or_base64()
    {
        const string json = """{"type":"service_account","project_id":"p"}""";
        Assert.Equal(json, new PushOptions { FcmServiceAccountJson = json }.ServiceAccountJson());
        Assert.Equal(json, new PushOptions { FcmServiceAccountJson = Convert.ToBase64String(Encoding.UTF8.GetBytes(json)) }.ServiceAccountJson());
        Assert.Null(new PushOptions { FcmServiceAccountJson = "  " }.ServiceAccountJson());
        Assert.Null(new PushOptions { FcmServiceAccountJson = "%%%not base64" }.ServiceAccountJson());
    }

    [Fact]
    public void A_key_without_a_private_key_is_refused()
    {
        var options = new PushOptions { FcmServiceAccountJson = """{"type":"service_account","project_id":"p","client_email":"x@p.iam.gserviceaccount.com"}""" };
        Assert.ThrowsAny<Exception>(() => FcmPushSender.Load(options));
    }
}
