using System.Net;
using Microsoft.Extensions.DependencyInjection;
using UniSync.Api.Setup;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>Offerings, the weekly routine (with clash checks) and the first-admin bootstrap.</summary>
[Collection(DatabaseTests.Name)]
public sealed class TimetableSetupTests(PostgresFixture db) : SetupTestBase(db)
{
    private sealed record World(SeededPlacement Placement, string Admin, Guid TeacherA, Guid TeacherB, Guid Course1, Guid Course2, Guid Room);

    private async Task<World> WorldAsync()
    {
        var (placement, admin) = await DepartmentAsync();
        var tag = Guid.NewGuid().ToString("N")[..4].ToUpperInvariant();
        Guid Id(System.Text.Json.JsonElement e) => e.GetProperty("id").GetGuid();

        var teacherA = Id(Ok(await PostAsync("/api/v1/teachers", new { phone = Seed.RandomPhone(), firstName = "Karim", lastName = "Hossain" }, admin), HttpStatusCode.Created));
        var teacherB = Id(Ok(await PostAsync("/api/v1/teachers", new { phone = Seed.RandomPhone(), firstName = "Nila", lastName = "Das" }, admin), HttpStatusCode.Created));
        var course1 = Id(Ok(await PostAsync("/api/v1/courses", new { code = $"C1-{tag}", name = "Programming", creditHours = 3, semester = 1 }, admin), HttpStatusCode.Created));
        var course2 = Id(Ok(await PostAsync("/api/v1/courses", new { code = $"C2-{tag}", name = "Physics", creditHours = 3, semester = 1 }, admin), HttpStatusCode.Created));
        var room = await Seed.RoomAsync(Db.ConnectionString, "401", "Main Building", Ct);
        return new World(placement, admin, teacherA, teacherB, course1, course2, room);
    }

    private async Task<Guid> OfferingAsync(World w, Guid course, Guid section, Guid teacher) =>
        Ok(await PostAsync("/api/v1/offerings", new { courseId = course, sectionId = section, teacherId = teacher, academicYear = "2026" }, w.Admin),
            HttpStatusCode.Created).GetProperty("id").GetGuid();

    private static object Slot(Guid offering, int day, string start, string end, Guid? room = null,
        string from = "2026-09-01", string to = "2027-01-31", bool active = true) =>
        new { offeringId = offering, dayOfWeek = day, startTime = start, endTime = end, roomId = room, effectiveFrom = from, effectiveTo = to, isActive = active };

    [Fact]
    public async Task Offerings_round_trip_and_feed_the_students_week()
    {
        var w = await WorldAsync();
        var offering = Ok(await PostAsync("/api/v1/offerings",
            new { courseId = w.Course1, sectionId = w.Placement.SectionId, teacherId = w.TeacherA, academicYear = "2026-27" }, w.Admin), HttpStatusCode.Created);
        var id = offering.GetProperty("id").GetGuid();
        Assert.Equal("Karim Hossain", offering.GetProperty("teacher").GetProperty("name").GetString());
        Assert.Equal(w.Placement.BatchId, offering.GetProperty("batch").GetProperty("id").GetGuid());

        Fails(await PostAsync("/api/v1/offerings",
            new { courseId = w.Course1, sectionId = w.Placement.SectionId, teacherId = w.TeacherB, academicYear = "2026" }, w.Admin),
            HttpStatusCode.Conflict, "ALREADY_EXISTS");
        Fails(await PostAsync("/api/v1/offerings", new { courseId = w.Course1 }, w.Admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");

        var reassigned = Ok(await PatchAsync($"/api/v1/offerings/{id}", new { teacherId = w.TeacherB }, w.Admin));
        Assert.Equal(w.TeacherB, reassigned.GetProperty("teacher").GetProperty("id").GetGuid());
        Fails(await PatchAsync($"/api/v1/offerings/{id}", new { courseId = w.Course2 }, w.Admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        Assert.Single(Ok(await GetAsync($"/api/v1/offerings?teacherId={w.TeacherB}", w.Admin)).EnumerateArray());

        // A routine slot makes it show in the section's week.
        var slot = Ok(await PostAsync("/api/v1/routines", Slot(id, (int)DayOfWeek.Monday, "09:00", "10:15", w.Room), w.Admin), HttpStatusCode.Created);
        Assert.Equal("401, Main Building", slot.GetProperty("room").GetProperty("label").GetString());
        Assert.Equal("09:00:00", slot.GetProperty("startTime").GetString());
        Factory.CampusTime.Now = new DateTimeOffset(2026, 11, 9, 8, 0, 0, TimeSpan.FromHours(6)); // Monday
        var phone = Seed.RandomPhone();
        Ok(await PostAsync("/api/v1/students", new
        {
            phone, firstName = "S", lastName = "T", studentId = "W-" + Guid.NewGuid().ToString("N")[..8], sectionId = w.Placement.SectionId,
        }, w.Admin), HttpStatusCode.Created);
        var today = Ok(await GetAsync("/api/v1/me/today", await AccessTokenAsync(phone)));
        Assert.Contains("Programming", today.ToString());

        // In use: can't delete the offering until its classes are removed.
        Fails(await DeleteAsync($"/api/v1/offerings/{id}", w.Admin), HttpStatusCode.Conflict, "IN_USE");
        Ok(await DeleteAsync($"/api/v1/routines/{slot.GetProperty("id").GetGuid()}", w.Admin));
        Ok(await DeleteAsync($"/api/v1/offerings/{id}", w.Admin));
    }

    [Fact]
    public async Task Offerings_only_use_this_departments_courses_sections_and_active_teachers()
    {
        var w = await WorldAsync();
        var other = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var (otherTeacher, _) = await Seed.TeacherAsync(Db.ConnectionString, other.BatchId, "Far", "Away", Ct);
        var otherOffering = await Seed.OfferingAsync(Db.ConnectionString, "OUT-1", other.SectionId, other.BatchId, otherTeacher, Ct);

        Fails(await PostAsync("/api/v1/offerings", new { courseId = w.Course1, sectionId = other.SectionId, teacherId = w.TeacherA, academicYear = "2026" }, w.Admin),
            HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PostAsync("/api/v1/offerings", new { courseId = w.Course1, sectionId = w.Placement.SectionId, teacherId = otherTeacher, academicYear = "2026" }, w.Admin),
            HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PatchAsync($"/api/v1/offerings/{otherOffering}", new { isActive = false }, w.Admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PostAsync("/api/v1/routines", Slot(otherOffering, 1, "09:00", "10:00"), w.Admin), HttpStatusCode.NotFound, "NOT_FOUND");

        Ok(await PatchAsync($"/api/v1/teachers/{w.TeacherA}", new { isActive = false }, w.Admin));
        Fails(await PostAsync("/api/v1/offerings", new { courseId = w.Course1, sectionId = w.Placement.SectionId, teacherId = w.TeacherA, academicYear = "2026" }, w.Admin),
            HttpStatusCode.BadRequest, "VALIDATION_FAILED");
    }

    [Fact]
    public async Task Routine_slots_refuse_section_teacher_and_room_clashes()
    {
        var w = await WorldAsync();
        var sectionB = Ok(await PostAsync("/api/v1/sections", new { batchId = w.Placement.BatchId, name = "B" }, w.Admin), HttpStatusCode.Created)
            .GetProperty("id").GetGuid();
        var a1 = await OfferingAsync(w, w.Course1, w.Placement.SectionId, w.TeacherA); // section A, Karim
        var a2 = await OfferingAsync(w, w.Course2, w.Placement.SectionId, w.TeacherB); // section A, Nila
        var b1 = await OfferingAsync(w, w.Course1, sectionB, w.TeacherA);              // section B, Karim
        var b2 = await OfferingAsync(w, w.Course2, sectionB, w.TeacherB);              // section B, Nila

        var monday = (int)DayOfWeek.Monday;
        var first = Ok(await PostAsync("/api/v1/routines", Slot(a1, monday, "09:00", "10:00", w.Room), w.Admin), HttpStatusCode.Created)
            .GetProperty("id").GetGuid();

        Fails(await PostAsync("/api/v1/routines", Slot(a2, monday, "09:30", "10:30"), w.Admin), HttpStatusCode.Conflict, "SECTION_BUSY");
        Fails(await PostAsync("/api/v1/routines", Slot(b1, monday, "09:59", "11:00"), w.Admin), HttpStatusCode.Conflict, "TEACHER_BUSY");
        Fails(await PostAsync("/api/v1/routines", Slot(b2, monday, "08:30", "09:30", w.Room), w.Admin), HttpStatusCode.Conflict, "ROOM_TAKEN");

        // Back to back, another day, a later term, or inactive: fine.
        Ok(await PostAsync("/api/v1/routines", Slot(a2, monday, "10:00", "11:00"), w.Admin), HttpStatusCode.Created);
        Ok(await PostAsync("/api/v1/routines", Slot(b1, (int)DayOfWeek.Tuesday, "09:00", "10:00", w.Room), w.Admin), HttpStatusCode.Created);
        Ok(await PostAsync("/api/v1/routines", Slot(b2, monday, "09:00", "10:00", w.Room, from: "2027-02-01", to: "2027-06-30"), w.Admin), HttpStatusCode.Created);
        Ok(await PostAsync("/api/v1/routines", Slot(b2, monday, "09:00", "10:00", w.Room, active: false), w.Admin), HttpStatusCode.Created);

        // Editing a slot doesn't clash with itself; moving it onto another does.
        Ok(await PutAsync($"/api/v1/routines/{first}", Slot(a1, monday, "08:30", "09:45", w.Room), w.Admin));
        Fails(await PutAsync($"/api/v1/routines/{first}", Slot(a1, monday, "10:30", "11:30", w.Room), w.Admin), HttpStatusCode.Conflict, "SECTION_BUSY");

        var list = Ok(await GetAsync($"/api/v1/routines?sectionId={w.Placement.SectionId}&day={monday}", w.Admin)).EnumerateArray().ToList();
        Assert.Equal(["08:30:00", "10:00:00"], list.Select(r => r.GetProperty("startTime").GetString()));
    }

    [Fact]
    public async Task Routine_input_is_validated_and_deleting_removes_its_class_changes()
    {
        var w = await WorldAsync();
        var offering = await OfferingAsync(w, w.Course1, w.Placement.SectionId, w.TeacherA);

        var error = Fails(await PostAsync("/api/v1/routines",
            new { offeringId = offering, dayOfWeek = 7, startTime = "10:00", endTime = "09:00", eventType = "party", effectiveFrom = "2027-02-01", effectiveTo = "2026-01-01" },
            w.Admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        var details = error.GetProperty("details");
        foreach (var field in new[] { "dayOfWeek", "endTime", "eventType", "effectiveTo" })
        {
            Assert.True(details.TryGetProperty(field, out _), field);
        }

        Fails(await PostAsync("/api/v1/routines", Slot(offering, 1, "09:00", "10:00", Guid.NewGuid()), w.Admin), HttpStatusCode.NotFound, "NOT_FOUND");

        var slot = Ok(await PostAsync("/api/v1/routines", Slot(offering, 1, "09:00", "10:00"), w.Admin), HttpStatusCode.Created).GetProperty("id").GetGuid();
        await Seed.ClassChangeAsync(Db.ConnectionString, slot, "2026-11-09", "cancellation", w.TeacherA, Ct);
        Ok(await DeleteAsync($"/api/v1/routines/{slot}", w.Admin));
        Assert.Equal(0, await CountAsync("SELECT count(*) FROM event.routine_exception WHERE routine_id = @r", ("r", slot)));
        Fails(await DeleteAsync($"/api/v1/routines/{slot}", w.Admin), HttpStatusCode.NotFound, "NOT_FOUND");
    }

    // ---------------------------------------------------------------- create-admin

    [Fact]
    public async Task Create_admin_bootstraps_a_department_and_its_admin_idempotently()
    {
        var phone = Seed.RandomPhone();
        var code = "B" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        string[] args = ["create-admin", "--phone", "0" + phone[4..], "--first-name", "Head", "--last-name", "Admin",
            "--department-code", code.ToLowerInvariant(), "--department-name", "Bootstrap Department"];

        var first = await AdminBootstrap.RunAsync(Factory.Services, args, Ct);
        Assert.True(first.Ok, first.Message);
        Assert.Contains("created department", first.Message);
        var again = await AdminBootstrap.RunAsync(Factory.Services, args, Ct);
        Assert.True(again.Ok, again.Message);
        Assert.Contains("already set up", again.Message);

        Assert.Equal(1, await CountAsync("SELECT count(*) FROM academic.department WHERE code = @c", ("c", code)));
        Assert.Equal(1, await CountAsync("""
            SELECT count(*) FROM "user".account a JOIN academic.department d ON d.id = a.managed_department_id
            JOIN "user".profile p ON p.user_id = a.id
            WHERE a.phone = @p AND a.role = 'admin' AND d.code = @c AND p.first_name = 'Head'
            """, ("p", phone), ("c", code)));

        // The new admin signs in and manages the department.
        var token = await AccessTokenAsync(phone);
        Assert.Equal(code, Ok(await GetAsync("/api/v1/department", token)).GetProperty("code").GetString());
    }

    [Fact]
    public async Task A_teacher_promoted_to_admin_leaves_the_teacher_screens()
    {
        // Security review: a faculty row left behind on a promoted account let another
        // department's admin edit that admin's phone through PATCH /teachers and take it over.
        var (_, adminA) = await DepartmentAsync();
        var phone = Seed.RandomPhone();
        var teacherId = Ok(await PostAsync("/api/v1/teachers", new { phone, firstName = "Rafi", lastName = "Kabir" }, adminA),
            HttpStatusCode.Created).GetProperty("id").GetGuid();
        var teacherToken = await AccessTokenAsync(phone);

        var code = "P" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        var promoted = await AdminBootstrap.RunAsync(Factory.Services,
            ["create-admin", "--phone", phone, "--first-name", "Rafi", "--last-name", "Kabir", "--department-code", code, "--department-name", "Promoted Dept"], Ct);
        Assert.True(promoted.Ok, promoted.Message);

        Fails(await PatchAsync($"/api/v1/teachers/{teacherId}", new { phone = Seed.RandomPhone() }, adminA), HttpStatusCode.NotFound, "NOT_FOUND");
        Assert.DoesNotContain(Ok(await GetAsync("/api/v1/teachers", adminA)).EnumerateArray(), t => t.GetProperty("id").GetGuid() == teacherId);
        Assert.Equal(0, await CountAsync("""SELECT count(*) FROM "user".faculty WHERE user_id = @id""", ("id", teacherId)));
        Assert.Equal(phone, await Seed.ScalarAsync<string>(Db.ConnectionString, """SELECT phone FROM "user".account WHERE id = @id""", Ct, ("id", teacherId)));

        // The token issued while they were a teacher is revoked; a fresh sign-in is the admin.
        Fails(await GetAsync("/api/v1/me", teacherToken), HttpStatusCode.Unauthorized, "SESSION_REVOKED");
        Assert.Equal(code, Ok(await GetAsync("/api/v1/department", await AccessTokenAsync(phone))).GetProperty("code").GetString());
    }

    [Fact]
    public async Task Create_admin_needs_the_existing_departments_exact_name()
    {
        var (placement, _) = await DepartmentAsync();
        var code = await Seed.ScalarAsync<string>(Db.ConnectionString, "SELECT code FROM academic.department WHERE id = @id", Ct,
            ("id", placement.DepartmentId));
        var phone = Seed.RandomPhone();

        var wrong = await AdminBootstrap.RunAsync(Factory.Services,
            ["create-admin", "--phone", phone, "--first-name", "A", "--last-name", "B", "--department-code", code!, "--department-name", "Something Else"], Ct);
        Assert.False(wrong.Ok);
        Assert.Contains("already exists", wrong.Message);
        Assert.Equal(0, await CountAsync("""SELECT count(*) FROM "user".account WHERE phone = @p""", ("p", phone)));
    }

    [Fact]
    public async Task Create_admin_refuses_bad_input()
    {
        var services = Factory.Services.GetRequiredService<IServiceProvider>();
        Assert.False((await AdminBootstrap.RunAsync(services, ["create-admin", "--phone", "017"], Ct)).Ok);
        Assert.False((await AdminBootstrap.RunAsync(services,
            ["create-admin", "--phone", "123", "--first-name", "A", "--last-name", "B", "--department-code", "CSE"], Ct)).Ok);
        var missingName = await AdminBootstrap.RunAsync(services,
            ["create-admin", "--phone", Seed.RandomPhone(), "--first-name", "A", "--last-name", "B", "--department-code", "NEW-" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()], Ct);
        Assert.False(missingName.Ok);
        Assert.Contains("--department-name", missingName.Message);
    }
}
