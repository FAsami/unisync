using System.Net;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

[Collection(DatabaseTests.Name)]
public sealed class DepartmentSetupTests(PostgresFixture db) : SetupTestBase(db)
{
    [Fact]
    public async Task Setup_routes_need_a_signed_in_department_admin()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var studentToken = await AccessTokenAsync(student.Phone);
        var noDepartment = await AccessTokenAsync(await Seed.AdminAsync(Db.ConnectionString, null, Ct));

        string[] routes = ["/api/v1/department", "/api/v1/batches", "/api/v1/courses", "/api/v1/teachers", "/api/v1/students",
            "/api/v1/offerings", "/api/v1/routines"];
        foreach (var route in routes)
        {
            Fails(await GetAsync(route), HttpStatusCode.Unauthorized, "UNAUTHORIZED");
            Fails(await GetAsync(route, studentToken), HttpStatusCode.Forbidden, "FORBIDDEN");
            Fails(await GetAsync(route, noDepartment), HttpStatusCode.Forbidden, "FORBIDDEN");
        }

        // Writes are refused the same way.
        Fails(await PostAsync("/api/v1/batches", new { name = "X", year = 2026, semesterCount = 8 }, studentToken),
            HttpStatusCode.Forbidden, "FORBIDDEN");
        Fails(await PostAsync("/api/v1/buildings", new { name = "X", code = "X1", address = "Campus" }, studentToken),
            HttpStatusCode.Forbidden, "FORBIDDEN");
    }

    [Fact]
    public async Task An_admin_reads_and_edits_only_their_own_department()
    {
        var (placement, admin) = await DepartmentAsync();

        var department = Ok(await GetAsync("/api/v1/department", admin));
        Assert.Equal(placement.DepartmentId, department.GetProperty("id").GetGuid());

        var saved = Ok(await PatchAsync("/api/v1/department", new { name = "Computer Science", description = "Main building" }, admin));
        Assert.Equal("Computer Science", saved.GetProperty("name").GetString());
        Assert.Equal("Main building", saved.GetProperty("description").GetString());
        Assert.Equal("Computer Science", await Seed.ScalarAsync<string>(Db.ConnectionString,
            "SELECT name FROM academic.department WHERE id = @d", Ct, ("d", placement.DepartmentId)));

        // Blank name and bad code are refused; another department's code is taken.
        Fails(await PatchAsync("/api/v1/department", new { name = " " }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        Fails(await PatchAsync("/api/v1/department", new { code = "c s e!" }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        var other = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var otherCode = "EEE-" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        await Seed.ExecuteAsync(Db.ConnectionString, "UPDATE academic.department SET code = @c WHERE id = @d", Ct,
            ("c", otherCode), ("d", other.DepartmentId));
        Fails(await PatchAsync("/api/v1/department", new { code = otherCode.ToLowerInvariant() }, admin), HttpStatusCode.Conflict, "ALREADY_EXISTS");
    }

    [Fact]
    public async Task Batches_and_sections_round_trip()
    {
        var (placement, admin) = await DepartmentAsync();

        var batch = Ok(await PostAsync("/api/v1/batches",
            new { name = "2027", year = 2027, semesterCount = 8, currentSemester = 1, startDate = "2027-01-10", endDate = "2030-12-31" }, admin),
            HttpStatusCode.Created);
        var batchId = batch.GetProperty("id").GetGuid();
        Assert.Equal(0, batch.GetProperty("sections").GetArrayLength());

        var section = Ok(await PostAsync("/api/v1/sections", new { batchId, name = "B", capacity = 40 }, admin), HttpStatusCode.Created);
        var sectionId = section.GetProperty("id").GetGuid();

        // Listed with its sections, newest year first, and counts students.
        await Seed.ExecuteAsync(Db.ConnectionString, """
            WITH a AS (INSERT INTO "user".account (phone, role) VALUES (@phone, 'student') RETURNING id)
            INSERT INTO "user".profile (user_id, first_name, last_name, department_id, batch_id, section_id)
            SELECT a.id, 'Rafi', 'Ahmed', @d, @b, @s FROM a
            """, Ct, ("phone", Seed.RandomPhone()), ("d", placement.DepartmentId), ("b", batchId), ("s", sectionId));
        var list = Ok(await GetAsync("/api/v1/batches", admin)).EnumerateArray().ToList();
        Assert.Equal(["2027", "2026"], list.Select(b => b.GetProperty("name").GetString()));
        Assert.Equal(1, list[0].GetProperty("studentCount").GetInt32());
        Assert.Equal("B", list[0].GetProperty("sections")[0].GetProperty("name").GetString());

        // Edit: semester moves on; inconsistent values are refused.
        var edited = Ok(await PatchAsync($"/api/v1/batches/{batchId}", new { currentSemester = 2 }, admin));
        Assert.Equal(2, edited.GetProperty("currentSemester").GetInt32());
        Fails(await PatchAsync($"/api/v1/batches/{batchId}", new { currentSemester = 9 }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        Fails(await PatchAsync($"/api/v1/batches/{batchId}", new { endDate = "2026-01-01" }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        Fails(await PatchAsync($"/api/v1/batches/{batchId}", new { name = "2026" }, admin), HttpStatusCode.Conflict, "ALREADY_EXISTS");

        Ok(await PatchAsync($"/api/v1/sections/{sectionId}", new { name = "Blue", isActive = false }, admin));
        Assert.False(await Seed.ScalarAsync<bool>(Db.ConnectionString, "SELECT is_active FROM academic.section WHERE id = @s", Ct, ("s", sectionId)));
        Fails(await PostAsync("/api/v1/sections", new { batchId, name = "Blue" }, admin), HttpStatusCode.Conflict, "ALREADY_EXISTS");

        // In use: can't delete; deactivate instead. Empty ones can go.
        Fails(await DeleteAsync($"/api/v1/sections/{sectionId}", admin), HttpStatusCode.Conflict, "IN_USE");
        Fails(await DeleteAsync($"/api/v1/batches/{batchId}", admin), HttpStatusCode.Conflict, "IN_USE");
        var empty = Ok(await PostAsync("/api/v1/sections", new { batchId, name = "C" }, admin), HttpStatusCode.Created).GetProperty("id").GetGuid();
        Ok(await DeleteAsync($"/api/v1/sections/{empty}", admin));
        Assert.Equal(0, await CountAsync("SELECT count(*) FROM academic.section WHERE id = @s", ("s", empty)));
    }

    [Fact]
    public async Task Batch_input_is_validated()
    {
        var (_, admin) = await DepartmentAsync();
        var error = Fails(await PostAsync("/api/v1/batches", new { name = "", year = 1800, semesterCount = 40 }, admin),
            HttpStatusCode.BadRequest, "VALIDATION_FAILED");
        var details = error.GetProperty("details");
        Assert.True(details.TryGetProperty("name", out _));
        Assert.True(details.TryGetProperty("year", out _));
        Assert.True(details.TryGetProperty("semesterCount", out _));
        Fails(await PostAsync("/api/v1/sections", new { name = "A" }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
    }

    [Fact]
    public async Task Another_departments_batches_and_sections_answer_404()
    {
        var (_, admin) = await DepartmentAsync();
        var other = await Seed.PlacementAsync(Db.ConnectionString, Ct);

        Fails(await GetAsync($"/api/v1/batches/{other.BatchId}", admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PatchAsync($"/api/v1/batches/{other.BatchId}", new { name = "Mine" }, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await DeleteAsync($"/api/v1/batches/{other.BatchId}", admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PostAsync("/api/v1/sections", new { batchId = other.BatchId, name = "Z" }, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PatchAsync($"/api/v1/sections/{other.SectionId}", new { name = "Mine" }, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await DeleteAsync($"/api/v1/sections/{other.SectionId}", admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Assert.DoesNotContain(Ok(await GetAsync("/api/v1/batches", admin)).EnumerateArray(), b => b.GetProperty("id").GetGuid() == other.BatchId);

        // Untouched.
        Assert.Equal("2026", await Seed.ScalarAsync<string>(Db.ConnectionString, "SELECT name FROM academic.batch WHERE id = @b", Ct,
            ("b", other.BatchId)));
    }

    [Fact]
    public async Task Courses_round_trip_and_stay_in_their_department()
    {
        var (placement, admin) = await DepartmentAsync();

        var course = Ok(await PostAsync("/api/v1/courses",
            new { code = "cse-101", name = "Structured Programming", creditHours = 3, semester = 1, courseType = "theory" }, admin),
            HttpStatusCode.Created);
        var id = course.GetProperty("id").GetGuid();
        Assert.Equal("CSE-101", course.GetProperty("code").GetString());
        Assert.Equal("THEORY", course.GetProperty("courseType").GetString());

        Fails(await PostAsync("/api/v1/courses", new { code = "CSE-101", name = "Again", creditHours = 3, semester = 1 }, admin),
            HttpStatusCode.Conflict, "ALREADY_EXISTS");
        Fails(await PostAsync("/api/v1/courses", new { code = "X", name = "", creditHours = 30, semester = 0, courseType = "SEMINAR" }, admin),
            HttpStatusCode.BadRequest, "VALIDATION_FAILED");

        var lab = Ok(await PatchAsync($"/api/v1/courses/{id}", new { courseType = "LAB", creditHours = 1.5m }, admin));
        Assert.Equal(1.5m, lab.GetProperty("creditHours").GetDecimal());
        Assert.Single(Ok(await GetAsync("/api/v1/courses?semester=1", admin)).EnumerateArray());
        Assert.Empty(Ok(await GetAsync("/api/v1/courses?semester=2", admin)).EnumerateArray());

        // Offered → in use; another department's course → 404.
        var (teacherId, _) = await Seed.TeacherAsync(Db.ConnectionString, placement.BatchId, "Karim", "Hossain", Ct);
        await Seed.ExecuteAsync(Db.ConnectionString, """
            INSERT INTO academic.course_offering (course_id, batch_id, section_id, teacher_id, academic_year) VALUES (@c, @b, @s, @t, '2026')
            """, Ct, ("c", id), ("b", placement.BatchId), ("s", placement.SectionId), ("t", teacherId));
        Fails(await DeleteAsync($"/api/v1/courses/{id}", admin), HttpStatusCode.Conflict, "IN_USE");

        var other = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var otherCourse = await Seed.ScalarAsync<Guid>(Db.ConnectionString, """
            INSERT INTO academic.course (department_id, code, name, credit_hours, semester) VALUES (@d, 'MAT-1', 'Calculus', 3, 1) RETURNING id
            """, Ct, ("d", other.DepartmentId));
        Fails(await PatchAsync($"/api/v1/courses/{otherCourse}", new { name = "Mine" }, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await DeleteAsync($"/api/v1/courses/{otherCourse}", admin), HttpStatusCode.NotFound, "NOT_FOUND");
    }

    [Fact]
    public async Task Rooms_are_listed_for_everyone_and_edited_by_admins()
    {
        var (_, admin) = await DepartmentAsync();
        var student = await AccessTokenAsync((await Seed.StudentAsync(Db.ConnectionString, ct: Ct)).Phone);
        var code = "AB" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();

        var building = Ok(await PostAsync("/api/v1/buildings", new { name = "Academic Building 2", code, address = "North campus" }, admin),
            HttpStatusCode.Created);
        var buildingId = building.GetProperty("id").GetGuid();
        Fails(await PostAsync("/api/v1/buildings", new { name = "Copy", code, address = "x" }, admin), HttpStatusCode.Conflict, "ALREADY_EXISTS");

        var room = Ok(await PostAsync("/api/v1/rooms", new { buildingId, roomNumber = "501", floor = "5", capacity = 60 }, admin),
            HttpStatusCode.Created);
        var roomId = room.GetProperty("id").GetGuid();
        Assert.Equal("501, Academic Building 2", room.GetProperty("label").GetString());
        Assert.Equal("501", room.GetProperty("roomName").GetString()); // defaults to the number
        Fails(await PostAsync("/api/v1/rooms", new { buildingId, roomNumber = "501", floor = "5" }, admin), HttpStatusCode.Conflict, "ALREADY_EXISTS");
        Fails(await PostAsync("/api/v1/rooms", new { buildingId = Guid.NewGuid(), roomNumber = "1", floor = "1" }, admin), HttpStatusCode.NotFound, "NOT_FOUND");

        // A student can list rooms (to pick one when moving a class) but not change them.
        var rooms = Ok(await GetAsync($"/api/v1/rooms?buildingId={buildingId}", student));
        Assert.Equal(roomId, rooms[0].GetProperty("id").GetGuid());
        Assert.Contains(Ok(await GetAsync("/api/v1/buildings", student)).EnumerateArray(), b => b.GetProperty("id").GetGuid() == buildingId);
        Fails(await PatchAsync($"/api/v1/rooms/{roomId}", new { capacity = 10 }, student), HttpStatusCode.Forbidden, "FORBIDDEN");
        Fails(await GetAsync("/api/v1/rooms"), HttpStatusCode.Unauthorized, "UNAUTHORIZED");

        Ok(await PatchAsync($"/api/v1/rooms/{roomId}", new { roomName = "Lab 1", capacity = 30 }, admin));
        Fails(await DeleteAsync($"/api/v1/buildings/{buildingId}", admin), HttpStatusCode.Conflict, "IN_USE");
        Ok(await DeleteAsync($"/api/v1/rooms/{roomId}", admin));
        Ok(await DeleteAsync($"/api/v1/buildings/{buildingId}", admin));
        Assert.Equal(0, await CountAsync("SELECT count(*) FROM venue.building WHERE id = @b", ("b", buildingId)));
    }
}
