using System.Net;
using System.Text.Json;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>
/// Fixed campus clock: Monday 9 November 2026, 10:30 in Dhaka (UTC+6).
/// The student's section has CSE101 09:00–11:00 and CSE102 11:30–12:30 on Mondays.
/// </summary>
[Collection(DatabaseTests.Name)]
public sealed class ScheduleTests : ApiTestBase
{
    private static readonly DateTimeOffset MondayMorning = new(2026, 11, 9, 10, 30, 0, TimeSpan.FromHours(6));

    public ScheduleTests(PostgresFixture db) : base(db) => Factory.CampusTime.Now = MondayMorning;

    private sealed record World(
        SeededStudent Student, Guid TeacherId, string TeacherPhone, Guid Cse101, Guid Cse102,
        Guid RoomA, Guid RoomB, Guid OtherSectionRoutine);

    private async Task<World> BuildAsync()
    {
        var cs = Db.ConnectionString;
        var student = await Seed.StudentAsync(cs, ct: Ct);
        var (teacherId, teacherPhone) = await Seed.TeacherAsync(cs, student.BatchId, "Rafiq", "Islam", Ct);
        var (otherTeacher, _) = await Seed.TeacherAsync(cs, student.BatchId, "Sumi", "Akter", Ct);
        var roomA = await Seed.RoomAsync(cs, "402", "Academic Building", Ct);
        var roomB = await Seed.RoomAsync(cs, "105", "Science Building", Ct);

        var cse101 = await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "CSE101", student.SectionId, student.BatchId, teacherId, Ct),
            DayOfWeek.Monday, "09:00", "11:00", Ct, roomId: roomA);
        // Written the way the legacy mobile app writes times: with "+06".
        var cse102 = await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "CSE102", student.SectionId, student.BatchId, otherTeacher, Ct),
            DayOfWeek.Monday, "11:30:00+06", "12:30:00+06", Ct, metadataRoom: "Lab 3");

        // Another section's class at the same time must never show up.
        var otherSection = await Seed.ScalarAsync<Guid>(cs, "INSERT INTO academic.section (name, batch_id) VALUES ('B', @b) RETURNING id", Ct, ("b", student.BatchId));
        var other = await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "CSE999", otherSection, student.BatchId, teacherId, Ct),
            DayOfWeek.Monday, "10:00", "11:00", Ct);

        return new World(student, teacherId, teacherPhone, cse101, cse102, roomA, roomB, other);
    }

    private async Task<JsonElement> TodayAsync(string phone)
    {
        var (status, body) = await GetAsync("/api/v1/me/today", await AccessTokenAsync(phone));
        Assert.Equal(HttpStatusCode.OK, status);
        return body.GetProperty("data");
    }

    private static List<JsonElement> Classes(JsonElement data) => [.. data.GetProperty("classes").EnumerateArray()];

    private static string Code(JsonElement c) => c.GetProperty("course").GetProperty("code").GetString()!;

    [Fact]
    public async Task Today_shows_only_my_sections_classes_in_order_with_now_and_next()
    {
        var world = await BuildAsync();
        var today = await TodayAsync(world.Student.Phone);

        Assert.Equal("2026-11-09", today.GetProperty("date").GetString());
        Assert.Equal("section", today.GetProperty("scope").GetString());

        var classes = Classes(today);
        Assert.Equal(["CSE101", "CSE102"], classes.Select(Code));
        Assert.DoesNotContain(classes, c => c.GetProperty("routineId").GetGuid() == world.OtherSectionRoutine);

        var first = classes[0];
        Assert.Equal("09:00:00", first.GetProperty("start").GetString());
        Assert.Equal("scheduled", first.GetProperty("status").GetString());
        Assert.Equal("402, Academic Building", first.GetProperty("room").GetString());
        Assert.Equal("Rafiq Islam", first.GetProperty("teacher").GetString());
        Assert.Equal("A", first.GetProperty("section").GetProperty("name").GetString());

        Assert.Equal("CSE101", Code(today.GetProperty("current")));
        Assert.Equal("CSE102", Code(today.GetProperty("next")));
    }

    [Fact]
    public async Task Legacy_times_keep_their_clock_digits_and_legacy_rooms_still_show()
    {
        var world = await BuildAsync();
        var cse102 = Classes(await TodayAsync(world.Student.Phone)).Single(c => Code(c) == "CSE102");
        Assert.Equal("11:30:00", cse102.GetProperty("start").GetString());
        Assert.Equal("12:30:00", cse102.GetProperty("end").GetString());
        Assert.Equal("Lab 3", cse102.GetProperty("room").GetString());
    }

    [Fact]
    public async Task A_cancelled_class_is_shown_as_cancelled_and_is_never_now_or_next()
    {
        var world = await BuildAsync();
        await Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09", "cancellation", world.TeacherId, Ct, reason: "Teacher unwell");

        var today = await TodayAsync(world.Student.Phone);
        var cse101 = Classes(today).Single(c => Code(c) == "CSE101");
        Assert.Equal("cancelled", cse101.GetProperty("status").GetString());
        Assert.Equal("Teacher unwell", cse101.GetProperty("note").GetString());
        Assert.Equal(JsonValueKind.Null, today.GetProperty("current").ValueKind);
        Assert.Equal("CSE102", Code(today.GetProperty("next")));
    }

    [Fact]
    public async Task A_room_change_shows_the_new_room()
    {
        var world = await BuildAsync();
        await Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09", "room_change", world.TeacherId, Ct,
            newRoomId: world.RoomB, reason: "Projector broken");

        var cse101 = Classes(await TodayAsync(world.Student.Phone)).Single(c => Code(c) == "CSE101");
        Assert.Equal("room_changed", cse101.GetProperty("status").GetString());
        Assert.Equal("105, Science Building", cse101.GetProperty("room").GetString());
    }

    [Fact]
    public async Task A_moved_class_appears_on_both_the_old_and_the_new_slot()
    {
        var world = await BuildAsync();
        await Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09", "reschedule", world.TeacherId, Ct,
            newDate: "2026-11-12", newStart: "14:00", newEnd: "16:00", newRoomId: world.RoomB, reason: "Exam hall booked");
        var token = await AccessTokenAsync(world.Student.Phone);

        var (status, body) = await GetAsync("/api/v1/me/week?start=2026-11-09", token);
        Assert.Equal(HttpStatusCode.OK, status);
        var days = body.GetProperty("data").GetProperty("days").EnumerateArray().ToList();
        Assert.Equal(7, days.Count);

        var monday = days[0].GetProperty("classes").EnumerateArray().Single(c => Code(c) == "CSE101");
        Assert.Equal("moved_away", monday.GetProperty("status").GetString());
        Assert.Equal("2026-11-12", monday.GetProperty("movedTo").GetProperty("date").GetString());
        Assert.Equal("14:00:00", monday.GetProperty("movedTo").GetProperty("start").GetString());

        var thursday = days[3];
        Assert.Equal("2026-11-12", thursday.GetProperty("date").GetString());
        var moved = thursday.GetProperty("classes").EnumerateArray().Single(c => Code(c) == "CSE101");
        Assert.Equal("moved", moved.GetProperty("status").GetString());
        Assert.Equal("14:00:00", moved.GetProperty("start").GetString());
        Assert.Equal("105, Science Building", moved.GetProperty("room").GetString());
        Assert.Equal("2026-11-09", moved.GetProperty("movedFrom").GetProperty("date").GetString());

        // A week that starts after the original slot still shows where the class went.
        var (_, later) = await GetAsync("/api/v1/me/week?start=2026-11-10", token);
        Assert.Contains(later.GetProperty("data").GetProperty("days").EnumerateArray().SelectMany(d => d.GetProperty("classes").EnumerateArray()),
            c => Code(c) == "CSE101" && c.GetProperty("status").GetString() == "moved");

        // And the moved-away placeholder is not "now".
        var today = await TodayAsync(world.Student.Phone);
        Assert.Equal(JsonValueKind.Null, today.GetProperty("current").ValueKind);
    }

    [Fact]
    public async Task Classes_outside_their_term_or_switched_off_do_not_appear()
    {
        var world = await BuildAsync();
        var cs = Db.ConnectionString;
        var s = world.Student;
        await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "OLD100", s.SectionId, s.BatchId, world.TeacherId, Ct),
            DayOfWeek.Monday, "13:00", "14:00", Ct, from: "2026-01-01", to: "2026-06-30");
        await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "OFF200", s.SectionId, s.BatchId, world.TeacherId, Ct),
            DayOfWeek.Monday, "14:00", "15:00", Ct, active: false);
        await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "OFF300", s.SectionId, s.BatchId, world.TeacherId, Ct, active: false),
            DayOfWeek.Monday, "15:00", "16:00", Ct);
        await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "TUE400", s.SectionId, s.BatchId, world.TeacherId, Ct),
            DayOfWeek.Tuesday, "09:00", "10:00", Ct);

        Assert.Equal(["CSE101", "CSE102"], Classes(await TodayAsync(s.Phone)).Select(Code));
    }

    [Fact]
    public async Task A_teacher_sees_the_classes_they_teach_across_sections()
    {
        var world = await BuildAsync();
        var today = await TodayAsync(world.TeacherPhone);

        Assert.Equal("teacher", today.GetProperty("scope").GetString());
        var classes = Classes(today);
        Assert.Equal(["CSE101", "CSE999"], classes.Select(Code));           // not CSE102: another teacher's
        Assert.Equal(["A", "B"], classes.Select(c => c.GetProperty("section").GetProperty("name").GetString()));
        // 10:30: CSE101 (09:00–11:00) and CSE999 (10:00–11:00) overlap; "current" is the earlier start.
        Assert.Equal("CSE101", Code(today.GetProperty("current")));
    }

    [Fact]
    public async Task Someone_without_a_section_gets_an_explicit_empty_scope()
    {
        var phone = Seed.RandomPhone();
        await Seed.ExecuteAsync(Db.ConnectionString, """INSERT INTO "user".account (phone, role) VALUES (@p, 'student')""", Ct, ("p", phone));

        var today = await TodayAsync(phone);
        Assert.Equal("none", today.GetProperty("scope").GetString());
        Assert.Empty(Classes(today));
    }

    [Fact]
    public async Task Today_follows_the_campus_date_not_utc()
    {
        // 00:30 Tuesday in Dhaka is still Monday 18:30 in UTC.
        var world = await BuildAsync();
        Factory.CampusTime.Now = new DateTimeOffset(2026, 11, 10, 0, 30, 0, TimeSpan.FromHours(6));
        var today = await TodayAsync(world.Student.Phone);
        Assert.Equal("2026-11-10", today.GetProperty("date").GetString());
        Assert.Empty(Classes(today)); // nothing on Tuesdays
    }

    [Fact]
    public async Task Week_validates_its_start_and_requires_sign_in()
    {
        var world = await BuildAsync();
        var token = await AccessTokenAsync(world.Student.Phone);

        var (bad, body) = await GetAsync("/api/v1/me/week?start=next-monday", token);
        Assert.Equal(HttpStatusCode.BadRequest, bad);
        Assert.Equal("VALIDATION_FAILED", ErrorCode(body));

        Assert.Equal(HttpStatusCode.Unauthorized, (await GetAsync("/api/v1/me/week")).Status);
        Assert.Equal(HttpStatusCode.Unauthorized, (await GetAsync("/api/v1/me/today")).Status);

        var (ok, week) = await GetAsync("/api/v1/me/week", token);
        Assert.Equal(HttpStatusCode.OK, ok);
        Assert.Equal("2026-11-09", week.GetProperty("data").GetProperty("from").GetString());
        Assert.Equal("2026-11-15", week.GetProperty("data").GetProperty("to").GetString());
    }

    [Fact]
    public async Task The_database_rejects_a_class_change_with_the_wrong_fields()
    {
        var world = await BuildAsync();
        await Assert.ThrowsAsync<Npgsql.PostgresException>(() => Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09",
            "reschedule", world.TeacherId, Ct)); // a move without a new slot
        await Assert.ThrowsAsync<Npgsql.PostgresException>(() => Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09",
            "cancellation", world.TeacherId, Ct, newRoomId: world.RoomB)); // a cancellation carrying a room
        await Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09", "cancellation", world.TeacherId, Ct);
        await Assert.ThrowsAsync<Npgsql.PostgresException>(() => Seed.ClassChangeAsync(Db.ConnectionString, world.Cse101, "2026-11-09",
            "cancellation", world.TeacherId, Ct)); // one decision per class occurrence
    }
}
