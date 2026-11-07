using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>Campus clock: Monday 9 November 2026, 08:00 in Dhaka, before the first class.</summary>
[Collection(DatabaseTests.Name)]
public sealed class ClassChangeTests : ApiTestBase
{
    private const string Today = "2026-11-09";

    public ClassChangeTests(PostgresFixture db) : base(db) =>
        Factory.CampusTime.Now = new DateTimeOffset(2026, 11, 9, 8, 0, 0, TimeSpan.FromHours(6));

    private Task<TimetableWorld> BuildAsync() => TimetableWorld.BuildAsync(Db.ConnectionString, Ct);

    private static string Url(Guid routine, string date, string action = "") => $"/api/v1/classes/{routine}/{date}{action}";

    private Task<long> ChangeCountAsync(Guid routine) =>
        Seed.ScalarAsync<long>(Db.ConnectionString, "SELECT count(*) FROM event.routine_exception WHERE routine_id = @r", Ct, ("r", routine));

    private Task<long> NoticeCountAsync(Guid section) =>
        Seed.ScalarAsync<long>(Db.ConnectionString, "SELECT count(*) FROM notification.log WHERE target_type = 'section' AND target_id = @s", Ct, ("s", section));

    private async Task<(string Title, string Body, string Change)> LastNoticeAsync(Guid section)
    {
        var title = await Seed.ScalarAsync<string>(Db.ConnectionString,
            "SELECT title FROM notification.log WHERE target_id = @s ORDER BY created_at DESC LIMIT 1", Ct, ("s", section));
        var body = await Seed.ScalarAsync<string>(Db.ConnectionString,
            "SELECT body FROM notification.log WHERE target_id = @s ORDER BY created_at DESC LIMIT 1", Ct, ("s", section));
        var change = await Seed.ScalarAsync<string>(Db.ConnectionString,
            "SELECT data->>'change' FROM notification.log WHERE target_id = @s ORDER BY created_at DESC LIMIT 1", Ct, ("s", section));
        return (title!, body!, change!);
    }

    private async Task<JsonElement> StudentClassAsync(TimetableWorld world, string code)
    {
        var (_, body) = await GetAsync("/api/v1/me/today", await AccessTokenAsync(world.Student.Phone));
        return body.GetProperty("data").GetProperty("classes").EnumerateArray()
            .Single(c => c.GetProperty("course").GetProperty("code").GetString() == code);
    }

    [Fact]
    public async Task The_teacher_cancels_a_class_and_the_section_is_notified()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);

        var (status, body) = await PostAsync(Url(world.Cse101, Today, "/cancel"), new { reason = "Teacher unwell" }, teacher);
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Equal("cancellation", body.GetProperty("data").GetProperty("change").GetString());

        var type = await Seed.ScalarAsync<string>(Db.ConnectionString,
            "SELECT type FROM event.routine_exception WHERE routine_id = @r AND exception_date = '2026-11-09'", Ct, ("r", world.Cse101));
        Assert.Equal("cancellation", type);

        var notice = await LastNoticeAsync(world.Student.SectionId);
        Assert.Equal("CSE101 cancelled", notice.Title);
        Assert.Equal("Mon 9 Nov, 09:00 class is cancelled: Teacher unwell", notice.Body);
        Assert.Equal("cancelled", notice.Change);

        var cse101 = await StudentClassAsync(world, "CSE101");
        Assert.Equal("cancelled", cse101.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Only_the_teacher_the_sections_cr_or_the_department_admin_may_change_a_class()
    {
        var world = await BuildAsync();
        var cs = Db.ConnectionString;
        var cancel = new { reason = "Holiday" };

        Assert.Equal(HttpStatusCode.Unauthorized, (await PostAsync(Url(world.Cse101, Today, "/cancel"), cancel)).Status);

        var student = await AccessTokenAsync(world.Student.Phone);
        var (forbidden, forbiddenBody) = await PostAsync(Url(world.Cse101, Today, "/cancel"), cancel, student);
        Assert.Equal(HttpStatusCode.Forbidden, forbidden);
        Assert.Equal("FORBIDDEN", ErrorCode(forbiddenBody));

        // Another teacher in the same department, and an admin of another department: no.
        var otherTeacher = await AccessTokenAsync(world.OtherTeacherPhone);
        Assert.Equal(HttpStatusCode.Forbidden, (await PostAsync(Url(world.Cse101, Today, "/cancel"), cancel, otherTeacher)).Status);
        var elsewhere = await Seed.PlacementAsync(cs, Ct);
        var foreignAdmin = await AccessTokenAsync(await Seed.AdminAsync(cs, elsewhere.DepartmentId, Ct));
        Assert.Equal(HttpStatusCode.Forbidden, (await PostAsync(Url(world.Cse101, Today, "/cancel"), cancel, foreignAdmin)).Status);
        Assert.Equal(0, await ChangeCountAsync(world.Cse101));

        // The section's CR: yes (and only for their own section).
        await Seed.ExecuteAsync(cs, "INSERT INTO academic.class_representative (user_id, section_id, batch_id) VALUES (@u, @s, @b)", Ct,
            ("u", world.Student.UserId), ("s", world.Student.SectionId), ("b", world.Student.BatchId));
        Assert.Equal(HttpStatusCode.OK, (await PostAsync(Url(world.Cse101, Today, "/cancel"), cancel, student)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await PostAsync(Url(world.Cse999, Today, "/cancel"), cancel, student)).Status);

        // The department's admin: yes.
        var departmentId = await Seed.ScalarAsync<Guid>(cs, "SELECT departmant_id FROM academic.batch WHERE id = @b", Ct, ("b", world.Student.BatchId));
        var admin = await AccessTokenAsync(await Seed.AdminAsync(cs, departmentId, Ct));
        Assert.Equal(HttpStatusCode.OK, (await PostAsync(Url(world.Cse102, Today, "/cancel"), cancel, admin)).Status);
    }

    [Fact]
    public async Task Moving_a_class_shows_on_the_new_slot_and_tells_students_where()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);

        var (status, body) = await PostAsync(Url(world.Cse101, Today, "/move"),
            new { date = "2026-11-12", start = "14:00", end = "16:00", roomId = world.RoomB, reason = "Exam hall booked" }, teacher);
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Equal("2026-11-12", body.GetProperty("data").GetProperty("movedTo").GetProperty("date").GetString());

        var notice = await LastNoticeAsync(world.Student.SectionId);
        Assert.Equal("CSE101 moved", notice.Title);
        Assert.Equal("Mon 9 Nov, 09:00 class moves to Thu 12 Nov, 14:00–16:00 in 105, Science Building: Exam hall booked", notice.Body);

        var (_, week) = await GetAsync("/api/v1/me/week?start=2026-11-09", await AccessTokenAsync(world.Student.Phone));
        var thursday = week.GetProperty("data").GetProperty("days")[3].GetProperty("classes").EnumerateArray().Single();
        Assert.Equal("moved", thursday.GetProperty("status").GetString());
        Assert.Equal("105, Science Building", thursday.GetProperty("room").GetString());
    }

    [Fact]
    public async Task A_move_onto_another_class_of_the_section_is_refused_and_nothing_is_sent()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        var before = await NoticeCountAsync(world.Student.SectionId);

        var (status, body) = await PostAsync(Url(world.Cse101, Today, "/move"),
            new { date = Today, start = "12:00", end = "13:00", reason = "Lab clash" }, teacher);
        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("SECTION_BUSY", ErrorCode(body));
        Assert.Equal("CSE102", body.GetProperty("error").GetProperty("details").GetProperty("course").GetString());
        Assert.Equal(0, await ChangeCountAsync(world.Cse101));
        Assert.Equal(before, await NoticeCountAsync(world.Student.SectionId));
    }

    [Fact]
    public async Task A_move_onto_another_class_the_teacher_teaches_is_refused()
    {
        // Rafiq also teaches CSE999 to section B on Mondays 10:00–11:00.
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        var (status, body) = await PostAsync(Url(world.Cse101, Today, "/move"),
            new { date = "2026-11-16", start = "10:30", end = "11:15", reason = "Swap" }, teacher);
        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("TEACHER_BUSY", ErrorCode(body));
    }

    [Fact]
    public async Task A_room_already_in_use_cannot_be_taken()
    {
        // CSE101 is in room A 09:00–11:00; CSE999 (10:00–11:00) can't move into it.
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        var (status, body) = await PostAsync(Url(world.Cse999, Today, "/room"), new { roomId = world.RoomA, reason = "Bigger room" }, teacher);
        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("ROOM_TAKEN", ErrorCode(body));

        // Room B is free, so that works and students see it.
        var (ok, _) = await PostAsync(Url(world.Cse999, Today, "/room"), new { roomId = world.RoomB, reason = "Bigger room" }, teacher);
        Assert.Equal(HttpStatusCode.OK, ok);
        Assert.Equal("CSE999 room changed", (await LastNoticeAsync(world.OtherSectionId)).Title);
    }

    [Fact]
    public async Task Bad_requests_say_what_is_wrong()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);

        Assert.Equal("NOT_A_CLASS_DAY", ErrorCode((await PostAsync(Url(world.Cse101, "2026-11-10", "/cancel"), new { reason = "x" }, teacher)).Body));
        Assert.Equal("CLASS_IN_PAST", ErrorCode((await PostAsync(Url(world.Cse101, "2026-11-02", "/cancel"), new { reason = "x" }, teacher)).Body));
        Assert.Equal("VALIDATION_FAILED", ErrorCode((await PostAsync(Url(world.Cse101, "9-11-2026", "/cancel"), new { reason = "x" }, teacher)).Body));
        Assert.Equal(HttpStatusCode.NotFound, (await PostAsync(Url(Guid.NewGuid(), Today, "/cancel"), new { reason = "x" }, teacher)).Status);

        var (noReason, noReasonBody) = await PostAsync(Url(world.Cse101, Today, "/cancel"), new { reason = "  " }, teacher);
        Assert.Equal(HttpStatusCode.BadRequest, noReason);
        Assert.True(noReasonBody.GetProperty("error").GetProperty("details").TryGetProperty("reason", out _));

        var (_, backwards) = await PostAsync(Url(world.Cse101, Today, "/move"),
            new { date = "2026-11-12", start = "16:00", end = "14:00", reason = "x" }, teacher);
        Assert.True(backwards.GetProperty("error").GetProperty("details").TryGetProperty("end", out _));

        var (_, pastMove) = await PostAsync(Url(world.Cse101, Today, "/move"),
            new { date = "2026-11-01", start = "10:00", end = "11:00", reason = "x" }, teacher);
        Assert.True(pastMove.GetProperty("error").GetProperty("details").TryGetProperty("date", out _));

        var (_, noRoom) = await PostAsync(Url(world.Cse101, Today, "/room"), new { roomId = Guid.NewGuid(), reason = "x" }, teacher);
        Assert.Equal("VALIDATION_FAILED", ErrorCode(noRoom));

        Assert.Equal(0, await ChangeCountAsync(world.Cse101));
    }

    [Fact]
    public async Task The_latest_decision_replaces_the_earlier_one()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        await PostAsync(Url(world.Cse101, Today, "/cancel"), new { reason = "Unwell" }, teacher);
        await PostAsync(Url(world.Cse101, Today, "/room"), new { roomId = world.RoomB, reason = "Feeling better, new room" }, teacher);

        Assert.Equal(1, await ChangeCountAsync(world.Cse101));
        var cse101 = await StudentClassAsync(world, "CSE101");
        Assert.Equal("room_changed", cse101.GetProperty("status").GetString());
        Assert.Equal("105, Science Building", cse101.GetProperty("room").GetString());
    }

    [Fact]
    public async Task Undo_restores_the_class_and_says_so()
    {
        var world = await BuildAsync();
        var teacher = await AccessTokenAsync(world.TeacherPhone);
        await PostAsync(Url(world.Cse101, Today, "/cancel"), new { reason = "Unwell" }, teacher);

        using var request = new HttpRequestMessage(HttpMethod.Delete, Url(world.Cse101, Today));
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", teacher);
        using var response = await Client.SendAsync(request, Ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        Assert.Equal(0, await ChangeCountAsync(world.Cse101));
        Assert.Equal("CSE101 back on", (await LastNoticeAsync(world.Student.SectionId)).Title);
        Assert.Equal("scheduled", (await StudentClassAsync(world, "CSE101")).GetProperty("status").GetString());

        using var again = new HttpRequestMessage(HttpMethod.Delete, Url(world.Cse101, Today));
        again.Headers.Authorization = new AuthenticationHeaderValue("Bearer", teacher);
        using var second = await Client.SendAsync(again, Ct);
        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
    }

    [Fact]
    public async Task Changes_are_rate_limited_per_user()
    {
        var world = await BuildAsync();
        using var limited = Factory.WithWebHostBuilder(b => b.UseSetting("RateLimits:ClassChangesPerHourPerUser", "2"));
        using var client = limited.CreateClient();
        var teacher = await AccessTokenAsync(world.TeacherPhone);

        HttpStatusCode last = default;
        for (var i = 0; i < 3; i++)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, Url(world.Cse101, Today, "/cancel"))
            {
                Content = JsonContent.Create(new { reason = $"Attempt {i}" }),
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", teacher);
            using var response = await client.SendAsync(request, Ct);
            last = response.StatusCode;
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, last);
    }
}
