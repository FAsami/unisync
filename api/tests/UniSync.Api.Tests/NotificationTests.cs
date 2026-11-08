using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

[Collection(DatabaseTests.Name)]
public sealed class NotificationTests(PostgresFixture db) : ApiTestBase(db)
{
    private Task<TimetableWorld> BuildAsync() => TimetableWorld.BuildAsync(Db.ConnectionString, Ct);

    private Task<Guid> DepartmentOfAsync(TimetableWorld world) =>
        Seed.ScalarAsync<Guid>(Db.ConnectionString, "SELECT departmant_id FROM academic.batch WHERE id = @b", Ct, ("b", world.Student.BatchId));

    private async Task<List<JsonElement>> AudiencesAsync(string token)
    {
        var (status, body) = await GetAsync("/api/v1/notifications/audiences", token);
        Assert.Equal(HttpStatusCode.OK, status);
        return [.. body.GetProperty("data").EnumerateArray()];
    }

    private async Task<JsonElement> InboxAsync(string token, string query = "")
    {
        var (status, body) = await GetAsync("/api/v1/me/notifications" + query, token);
        Assert.Equal(HttpStatusCode.OK, status);
        return body.GetProperty("data");
    }

    private static object Notice(string type, Guid id, string title = "Quiz on Thursday") =>
        new { title, body = "Chapters 3 and 4.", audience = new { type, id } };

    private async Task<HttpStatusCode> DeleteAsync(string path, string token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var response = await Client.SendAsync(request, Ct);
        return response.StatusCode;
    }

    private Task<bool?> DeviceActiveAsync(Guid userId, string deviceId) =>
        Seed.ScalarAsync<bool?>(Db.ConnectionString, """SELECT is_active FROM "user".device WHERE user_id = @u AND device_id = @d""", Ct,
            ("u", userId), ("d", deviceId));

    [Fact]
    public async Task Each_role_is_offered_only_the_audiences_it_may_address()
    {
        var world = await BuildAsync();
        var cs = Db.ConnectionString;
        var admin = await AccessTokenAsync(await Seed.AdminAsync(cs, await DepartmentOfAsync(world), Ct));

        var adminOptions = await AudiencesAsync(admin);
        Assert.Equal(["department", "batch", "section", "section"], adminOptions.Select(a => a.GetProperty("type").GetString()));
        var sectionA = adminOptions.Single(a => a.GetProperty("id").GetGuid() == world.Student.SectionId);
        Assert.Equal(1, sectionA.GetProperty("recipients").GetInt32());
        Assert.StartsWith("Section A · Batch 2026", sectionA.GetProperty("label").GetString(), StringComparison.Ordinal);
        // Department: the student, both teachers and the admin.
        Assert.Equal(4, adminOptions[0].GetProperty("recipients").GetInt32());

        var rafiq = await AudiencesAsync(await AccessTokenAsync(world.TeacherPhone));
        Assert.Equal(new[] { world.Student.SectionId, world.OtherSectionId }.Order(), rafiq.Select(a => a.GetProperty("id").GetGuid()).Order());
        var sumi = await AudiencesAsync(await AccessTokenAsync(world.OtherTeacherPhone));
        Assert.Equal([world.Student.SectionId], sumi.Select(a => a.GetProperty("id").GetGuid()));

        var student = await AccessTokenAsync(world.Student.Phone);
        Assert.Empty(await AudiencesAsync(student));
        await Seed.ExecuteAsync(cs, "INSERT INTO academic.class_representative (user_id, section_id, batch_id) VALUES (@u, @s, @b)", Ct,
            ("u", world.Student.UserId), ("s", world.Student.SectionId), ("b", world.Student.BatchId));
        Assert.Equal([world.Student.SectionId], (await AudiencesAsync(student)).Select(a => a.GetProperty("id").GetGuid()));
    }

    [Fact]
    public async Task A_teacher_sends_a_notice_and_the_student_reads_it()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        var student = await AccessTokenAsync(world.Student.Phone);

        var (status, sent) = await PostAsync("/api/v1/notifications", Notice("section", world.Student.SectionId), teacher);
        Assert.Equal(HttpStatusCode.Created, status);
        var id = sent.GetProperty("data").GetProperty("id").GetGuid();
        Assert.Equal(1, sent.GetProperty("data").GetProperty("recipients").GetInt32());
        Assert.Equal("Sent to 1 person.", sent.GetProperty("message").GetString());

        // The push payload can open the message: it carries the notification's id.
        var payloadId = await Seed.ScalarAsync<string>(Db.ConnectionString, "SELECT data->>'notificationId' FROM notification.log WHERE id = @id", Ct, ("id", id));
        Assert.Equal(id.ToString(), payloadId);

        var inbox = await InboxAsync(student);
        Assert.Equal(1, inbox.GetProperty("unreadCount").GetInt32());
        var item = inbox.GetProperty("items").EnumerateArray().Single();
        Assert.Equal(id, item.GetProperty("id").GetGuid());
        Assert.Equal("Quiz on Thursday", item.GetProperty("title").GetString());
        Assert.Equal("Rafiq Islam", item.GetProperty("from").GetString());
        Assert.Equal("notice", item.GetProperty("kind").GetString());
        Assert.False(item.GetProperty("read").GetBoolean());

        Assert.Equal(HttpStatusCode.OK, (await GetAsync($"/api/v1/me/notifications/{id}", student)).Status);
        Assert.Equal(HttpStatusCode.OK, (await PostAsync($"/api/v1/me/notifications/{id}/read", null, student)).Status);
        Assert.Equal(HttpStatusCode.OK, (await PostAsync($"/api/v1/me/notifications/{id}/read", null, student)).Status); // idempotent

        var after = await InboxAsync(student);
        Assert.Equal(0, after.GetProperty("unreadCount").GetInt32());
        Assert.True(after.GetProperty("items")[0].GetProperty("read").GetBoolean());

        var (_, sentList) = await GetAsync("/api/v1/notifications/sent", teacher);
        var mine = sentList.GetProperty("data").EnumerateArray().Single(s => s.GetProperty("id").GetGuid() == id);
        Assert.Equal(1, mine.GetProperty("readCount").GetInt32());
        Assert.StartsWith("Section A", mine.GetProperty("audience").GetString(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task Nobody_can_send_to_an_audience_outside_their_scope()
    {
        var world = await BuildAsync();
        var sumi = await AccessTokenAsync(world.OtherTeacherPhone);   // teaches section A only
        var student = await AccessTokenAsync(world.Student.Phone);
        var before = await Seed.ScalarAsync<long>(Db.ConnectionString, "SELECT count(*) FROM notification.log", Ct);

        var (status, body) = await PostAsync("/api/v1/notifications", Notice("section", world.OtherSectionId), sumi);
        Assert.Equal(HttpStatusCode.Forbidden, status);
        Assert.Equal("AUDIENCE_NOT_ALLOWED", ErrorCode(body));
        Assert.Equal(HttpStatusCode.Forbidden, (await PostAsync("/api/v1/notifications", Notice("section", world.Student.SectionId), student)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await PostAsync("/api/v1/notifications", Notice("all", Guid.Empty), sumi)).Status);
        Assert.Equal(HttpStatusCode.Unauthorized, (await PostAsync("/api/v1/notifications", Notice("section", world.Student.SectionId))).Status);

        Assert.Equal(before, await Seed.ScalarAsync<long>(Db.ConnectionString, "SELECT count(*) FROM notification.log", Ct));
    }

    [Fact]
    public async Task Bad_or_empty_sends_are_refused()
    {
        var world = await BuildAsync();
        var cs = Db.ConnectionString;
        var admin = await AccessTokenAsync(await Seed.AdminAsync(cs, await DepartmentOfAsync(world), Ct));

        var (status, body) = await PostAsync("/api/v1/notifications", new { title = " ", body = "" }, admin);
        Assert.Equal(HttpStatusCode.BadRequest, status);
        var details = body.GetProperty("error").GetProperty("details");
        foreach (var field in new[] { "title", "body", "audience" })
        {
            Assert.True(details.TryGetProperty(field, out _), $"missing error for {field}");
        }

        var empty = await Seed.ScalarAsync<Guid>(cs, "INSERT INTO academic.section (name, batch_id) VALUES ('C', @b) RETURNING id", Ct, ("b", world.Student.BatchId));
        var (emptyStatus, emptyBody) = await PostAsync("/api/v1/notifications", Notice("section", empty), admin);
        Assert.Equal(HttpStatusCode.BadRequest, emptyStatus);
        Assert.Equal("EMPTY_AUDIENCE", ErrorCode(emptyBody));
    }

    [Fact]
    public async Task The_inbox_holds_only_what_was_addressed_to_me()
    {
        var world = await BuildAsync();
        var cs = Db.ConnectionString;
        var department = await DepartmentOfAsync(world);
        var by = world.TeacherId;

        // Addressed to everyone, so it would land in every other test's inbox: removed in finally.
        var toEveryone = await Seed.NotificationAsync(cs, "all", Guid.Empty, by, "Campus closed Friday", Ct);
        try
        {
            var toDepartment = await Seed.NotificationAsync(cs, "department", department, by, "Department seminar", Ct);
            var toMySection = await Seed.NotificationAsync(cs, "section", world.Student.SectionId, by, "Section A lab", Ct);
            var toOtherSection = await Seed.NotificationAsync(cs, "section", world.OtherSectionId, by, "Section B lab", Ct);
            var toMe = await Seed.NotificationAsync(cs, "user", world.Student.UserId, by, "Your ID card is ready", Ct);
            var old = await Seed.NotificationAsync(cs, "section", world.Student.SectionId, by, "Last year", Ct, DateTimeOffset.UtcNow.AddDays(-200));

            var student = await AccessTokenAsync(world.Student.Phone);
            var ids = (await InboxAsync(student)).GetProperty("items").EnumerateArray().Select(i => i.GetProperty("id").GetGuid()).ToList();
            Assert.Equal(new[] { toEveryone, toDepartment, toMySection, toMe }.Order(), ids.Order());
            Assert.DoesNotContain(toOtherSection, ids);
            Assert.DoesNotContain(old, ids);
            Assert.Equal(HttpStatusCode.NotFound, (await GetAsync($"/api/v1/me/notifications/{toOtherSection}", student)).Status);
            Assert.Equal(HttpStatusCode.NotFound, (await PostAsync($"/api/v1/me/notifications/{toOtherSection}/read", null, student)).Status);

            // A teacher belongs to the department, not to the sections they teach.
            var teacherIds = (await InboxAsync(await AccessTokenAsync(world.OtherTeacherPhone))).GetProperty("items").EnumerateArray()
                .Select(i => i.GetProperty("id").GetGuid()).ToList();
            Assert.Contains(toDepartment, teacherIds);
            Assert.DoesNotContain(toMySection, teacherIds);
        }
        finally
        {
            await Seed.ExecuteAsync(cs, "DELETE FROM notification.log WHERE id = @id", Ct, ("id", toEveryone));
        }
    }

    [Fact]
    public async Task The_inbox_pages_newest_first_and_can_mark_everything_read()
    {
        var world = await BuildAsync();
        var start = DateTimeOffset.UtcNow.AddHours(-5);
        for (var i = 0; i < 5; i++)
        {
            await Seed.NotificationAsync(Db.ConnectionString, "section", world.Student.SectionId, world.TeacherId, $"Notice {i}", Ct, start.AddMinutes(i));
        }

        var student = await AccessTokenAsync(world.Student.Phone);
        var titles = new List<string>();
        string query = "?limit=2";
        for (var page = 0; page < 5; page++)
        {
            var data = await InboxAsync(student, query);
            Assert.Equal(5, data.GetProperty("unreadCount").GetInt32());
            titles.AddRange(data.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString()!));
            if (data.GetProperty("nextBefore").ValueKind == JsonValueKind.Null)
            {
                break;
            }

            query = "?limit=2&before=" + Uri.EscapeDataString(data.GetProperty("nextBefore").GetString()!);
        }

        Assert.Equal(["Notice 4", "Notice 3", "Notice 2", "Notice 1", "Notice 0"], titles);
        Assert.Equal(HttpStatusCode.BadRequest, (await GetAsync("/api/v1/me/notifications?limit=500", student)).Status);

        var (status, body) = await PostAsync("/api/v1/me/notifications/read-all", null, student);
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Equal(5, body.GetProperty("data").GetProperty("marked").GetInt32());
        Assert.Equal(0, (await InboxAsync(student)).GetProperty("unreadCount").GetInt32());
    }

    [Fact]
    public async Task A_class_change_lands_in_the_inbox_and_its_push_opens_it()
    {
        var world = await BuildAsync();
        Factory.CampusTime.Now = new DateTimeOffset(2026, 11, 9, 8, 0, 0, TimeSpan.FromHours(6));
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        await PostAsync($"/api/v1/classes/{world.Cse101}/2026-11-09/cancel", new { reason = "Teacher unwell" }, teacher);

        var item = (await InboxAsync(await AccessTokenAsync(world.Student.Phone))).GetProperty("items").EnumerateArray().Single();
        Assert.Equal("class_change", item.GetProperty("kind").GetString());
        Assert.Equal("CSE101 cancelled", item.GetProperty("title").GetString());
        Assert.Equal(item.GetProperty("id").GetGuid().ToString(), item.GetProperty("data").GetProperty("notificationId").GetString());
    }

    [Fact]
    public async Task A_push_token_follows_the_person_signed_in_on_the_phone()
    {
        var world = await BuildAsync();
        var student = await AccessTokenAsync(world.Student.Phone);
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        var device = new { deviceId = "install-1", token = "fcm-token-abc", platform = "android" };

        Assert.Equal(HttpStatusCode.OK, (await SendPutAsync("/api/v1/me/devices", device, student)).Status);
        Assert.True(await DeviceActiveAsync(world.Student.UserId, "install-1"));

        // Same phone, now the teacher signs in: the student stops getting its pushes.
        Assert.Equal(HttpStatusCode.OK, (await SendPutAsync("/api/v1/me/devices", device, teacher)).Status);
        Assert.Null(await DeviceActiveAsync(world.Student.UserId, "install-1"));
        Assert.True(await DeviceActiveAsync(world.TeacherId, "install-1"));

        // Re-registering updates the one row instead of adding another.
        Assert.Equal(HttpStatusCode.OK, (await SendPutAsync("/api/v1/me/devices", new { deviceId = "install-1", token = "fcm-token-new", platform = "android" }, teacher)).Status);
        var rows = await Seed.ScalarAsync<long>(Db.ConnectionString, """SELECT count(*) FROM "user".device WHERE user_id = @u""", Ct, ("u", world.TeacherId));
        Assert.Equal(1, rows);

        Assert.Equal(HttpStatusCode.OK, await DeleteAsync("/api/v1/me/devices/install-1", teacher));
        Assert.False(await DeviceActiveAsync(world.TeacherId, "install-1"));

        var (bad, badBody) = await SendPutAsync("/api/v1/me/devices", new { deviceId = "x", token = "y", platform = "nokia" }, teacher);
        Assert.Equal(HttpStatusCode.BadRequest, bad);
        Assert.Equal("VALIDATION_FAILED", ErrorCode(badBody));
        Assert.Equal(HttpStatusCode.Unauthorized, (await SendPutAsync("/api/v1/me/devices", device, null)).Status);
    }

    [Fact]
    public async Task Signing_out_with_a_device_id_stops_its_pushes_in_the_same_call()
    {
        var world = await BuildAsync();
        var student = await AccessTokenAsync(world.Student.Phone);
        await SendPutAsync("/api/v1/me/devices", new { deviceId = "install-9", token = "fcm-token-9", platform = "ios" }, student);

        var (status, _) = await PostAsync("/api/v1/auth/logout", new { deviceId = "install-9" }, student);
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.False(await DeviceActiveAsync(world.Student.UserId, "install-9"));
    }

    [Fact]
    public async Task Sending_is_rate_limited_per_user()
    {
        var world = await BuildAsync();
        using var limited = Factory.WithWebHostBuilder(b => b.UseSetting("RateLimits:NotificationsPerHourPerUser", "2"));
        using var client = limited.CreateClient();
        var teacher = await AccessTokenAsync(world.TeacherPhone);

        HttpStatusCode last = default;
        for (var i = 0; i < 3; i++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/notifications")
            {
                Content = JsonContent.Create(Notice("section", world.Student.SectionId, $"Notice {i}")),
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", teacher);
            using var response = await client.SendAsync(request, Ct);
            last = response.StatusCode;
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, last);
    }

    private async Task<(HttpStatusCode Status, JsonElement Body)> SendPutAsync(string path, object body, string? token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Put, path) { Content = JsonContent.Create(body) };
        if (token is not null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        using var response = await Client.SendAsync(request, Ct);
        return (response.StatusCode, await response.Content.ReadFromJsonAsync<JsonElement>(Ct));
    }
}
