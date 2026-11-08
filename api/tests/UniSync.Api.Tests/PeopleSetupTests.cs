using System.Net;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

[Collection(DatabaseTests.Name)]
public sealed class PeopleSetupTests(PostgresFixture db) : SetupTestBase(db)
{
    private static string Local(string e164) => "0" + e164[4..]; // +8801712345678 → 01712345678

    // ---------------------------------------------------------------- teachers

    [Fact]
    public async Task An_added_teacher_can_sign_in_and_is_listed()
    {
        var (placement, admin) = await DepartmentAsync();
        var phone = Seed.RandomPhone();

        var teacher = Ok(await PostAsync("/api/v1/teachers", new { phone = Local(phone), firstName = "Karim", lastName = "Hossain" }, admin),
            HttpStatusCode.Created);
        var id = teacher.GetProperty("id").GetGuid();
        Assert.Equal(phone, teacher.GetProperty("phone").GetString());
        Assert.Equal("Lecturer", teacher.GetProperty("designation").GetString());
        Assert.Equal("teacher", teacher.GetProperty("role").GetString());

        // Account (no password), profile and teacher row, all in this department.
        Assert.Equal(1, await CountAsync("""
            SELECT count(*) FROM "user".account a JOIN "user".faculty f ON f.user_id = a.id JOIN "user".profile p ON p.user_id = a.id
            WHERE a.id = @id AND a.role = 'teacher' AND a.password IS NULL AND f.department_id = @d AND f.faculty_id IS NULL AND p.department_id = @d
            """, ("id", id), ("d", placement.DepartmentId)));

        // They sign in by code, and /me knows their name.
        var token = await AccessTokenAsync(phone);
        var me = Ok(await GetAsync("/api/v1/me", token));
        Assert.Equal("Karim", me.GetProperty("firstName").GetString());

        Assert.Contains(Ok(await GetAsync("/api/v1/teachers?q=hoss", admin)).EnumerateArray(), t => t.GetProperty("id").GetGuid() == id);
        Assert.Empty(Ok(await GetAsync("/api/v1/teachers?q=nobody", admin)).EnumerateArray());
        Fails(await PostAsync("/api/v1/teachers", new { phone, firstName = "K", lastName = "H" }, admin), HttpStatusCode.Conflict, "ALREADY_EXISTS");
    }

    [Fact]
    public async Task Deactivating_a_teacher_signs_them_out()
    {
        var (_, admin) = await DepartmentAsync();
        var phone = Seed.RandomPhone();
        var id = Ok(await PostAsync("/api/v1/teachers", new { phone, firstName = "Nila", lastName = "Das", designation = "Professor" }, admin),
            HttpStatusCode.Created).GetProperty("id").GetGuid();
        var token = await AccessTokenAsync(phone);

        var saved = Ok(await PatchAsync($"/api/v1/teachers/{id}", new { designation = "Associate Professor", isActive = false }, admin));
        Assert.False(saved.GetProperty("isActive").GetBoolean());
        Assert.Equal("Associate Professor", saved.GetProperty("designation").GetString());

        Fails(await GetAsync("/api/v1/me", token), HttpStatusCode.Unauthorized, "SESSION_REVOKED");
        Assert.Equal("PHONE_NOT_REGISTERED", ErrorCode((await PostAsync("/api/v1/auth/code", new { phone })).Body));
    }

    [Fact]
    public async Task Teacher_validation_and_scope()
    {
        var (_, admin) = await DepartmentAsync();
        Fails(await PostAsync("/api/v1/teachers", new { phone = "123", firstName = "", lastName = "" }, admin),
            HttpStatusCode.BadRequest, "VALIDATION_FAILED");

        // A number with an account elsewhere (here a student) isn't turned into a teacher.
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        Fails(await PostAsync("/api/v1/teachers", new { phone = student.Phone, firstName = "A", lastName = "B" }, admin),
            HttpStatusCode.Conflict, "ALREADY_REGISTERED");

        // Another department's teacher is invisible.
        var other = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var (otherTeacher, _) = await Seed.TeacherAsync(Db.ConnectionString, other.BatchId, "Other", "Teacher", Ct);
        Fails(await PatchAsync($"/api/v1/teachers/{otherTeacher}", new { isActive = false }, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Assert.DoesNotContain(Ok(await GetAsync("/api/v1/teachers", admin)).EnumerateArray(), t => t.GetProperty("id").GetGuid() == otherTeacher);
        Assert.True(await Seed.ScalarAsync<bool>(Db.ConnectionString, """SELECT is_active FROM "user".account WHERE id = @id""", Ct, ("id", otherTeacher)));
    }

    // ---------------------------------------------------------------- students

    [Fact]
    public async Task An_added_student_signs_in_and_appears_on_the_roster()
    {
        var (placement, admin) = await DepartmentAsync();
        var phone = Seed.RandomPhone();
        var studentId = "CSE-" + Guid.NewGuid().ToString("N")[..8];

        var student = Ok(await PostAsync("/api/v1/students",
            new { phone, firstName = "Mitu", lastName = "Akter", studentId, sectionId = placement.SectionId }, admin), HttpStatusCode.Created);
        var id = student.GetProperty("id").GetGuid();
        Assert.Equal(placement.BatchId, student.GetProperty("batch").GetProperty("id").GetGuid());
        Assert.Equal("A", student.GetProperty("section").GetProperty("name").GetString());
        Assert.False(student.GetProperty("isClassRepresentative").GetBoolean());

        var me = Ok(await GetAsync("/api/v1/me", await AccessTokenAsync(phone)));
        Assert.Equal(studentId, me.GetProperty("studentId").GetString());

        var roster = Ok(await GetAsync($"/api/v1/students?sectionId={placement.SectionId}", admin));
        Assert.Equal(id, roster.EnumerateArray().Single().GetProperty("id").GetGuid());
        Assert.Single(Ok(await GetAsync("/api/v1/students?q=mitu", admin)).EnumerateArray());

        Fails(await PostAsync("/api/v1/students", new { phone, firstName = "X", lastName = "Y", studentId = "S-NEW", sectionId = placement.SectionId }, admin),
            HttpStatusCode.Conflict, "ALREADY_REGISTERED");
        Fails(await PostAsync("/api/v1/students",
            new { phone = Seed.RandomPhone(), firstName = "X", lastName = "Y", studentId, sectionId = placement.SectionId }, admin),
            HttpStatusCode.Conflict, "STUDENT_ID_TAKEN");
        Fails(await PostAsync("/api/v1/students", new { phone = "1", firstName = "", lastName = "Y", studentId = "bad id!" }, admin),
            HttpStatusCode.BadRequest, "VALIDATION_FAILED");
    }

    [Fact]
    public async Task Adding_a_student_settles_their_pending_request()
    {
        var (placement, admin) = await DepartmentAsync();
        var phone = Seed.RandomPhone();
        await Seed.ExecuteAsync(Db.ConnectionString, """
            INSERT INTO "user".access_request (phone, first_name, last_name, student_id, department_id, batch_id, section_id)
            VALUES (@p, 'Mitu', 'Akter', 'REQ-1', @d, @b, @s)
            """, Ct, ("p", phone), ("d", placement.DepartmentId), ("b", placement.BatchId), ("s", placement.SectionId));

        var id = Ok(await PostAsync("/api/v1/students",
            new { phone, firstName = "Mitu", lastName = "Akter", studentId = "S-" + Guid.NewGuid().ToString("N")[..8], sectionId = placement.SectionId },
            admin), HttpStatusCode.Created).GetProperty("id").GetGuid();

        Assert.Equal(1, await CountAsync("""
            SELECT count(*) FROM "user".access_request WHERE phone = @p AND status = 'approved' AND account_id = @id
            """, ("p", phone), ("id", id)));
    }

    [Fact]
    public async Task Moving_a_student_ends_their_CR_mark_and_deactivating_signs_them_out()
    {
        var (placement, admin) = await DepartmentAsync();
        var phone = Seed.RandomPhone();
        var id = Ok(await PostAsync("/api/v1/students",
            new { phone, firstName = "Rafi", lastName = "Ahmed", studentId = "S-" + Guid.NewGuid().ToString("N")[..8], sectionId = placement.SectionId },
            admin), HttpStatusCode.Created).GetProperty("id").GetGuid();

        var marked = Ok(await PutAsync($"/api/v1/students/{id}/class-representative", null, admin));
        Assert.True(marked.GetProperty("isClassRepresentative").GetBoolean());
        var token = await AccessTokenAsync(phone);
        Assert.True(Ok(await GetAsync("/api/v1/me", token)).GetProperty("isClassRepresentative").GetBoolean());
        Ok(await PutAsync($"/api/v1/students/{id}/class-representative", null, admin)); // idempotent

        var sectionB = Ok(await PostAsync("/api/v1/sections", new { batchId = placement.BatchId, name = "B" }, admin), HttpStatusCode.Created)
            .GetProperty("id").GetGuid();
        var moved = Ok(await PatchAsync($"/api/v1/students/{id}", new { sectionId = sectionB, lastName = "Ahmed Khan" }, admin));
        Assert.Equal("B", moved.GetProperty("section").GetProperty("name").GetString());
        Assert.False(moved.GetProperty("isClassRepresentative").GetBoolean());
        Assert.Equal(0, await CountAsync("SELECT count(*) FROM academic.class_representative WHERE user_id = @id AND is_active", ("id", id)));

        // Mark again in the new section, then unmark.
        Ok(await PutAsync($"/api/v1/students/{id}/class-representative", null, admin));
        Assert.False(Ok(await DeleteAsync($"/api/v1/students/{id}/class-representative", admin)).GetProperty("isClassRepresentative").GetBoolean());

        Ok(await PatchAsync($"/api/v1/students/{id}", new { isActive = false }, admin));
        Fails(await GetAsync("/api/v1/me", token), HttpStatusCode.Unauthorized, "SESSION_REVOKED");
        Fails(await PutAsync($"/api/v1/students/{id}/class-representative", null, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
    }

    [Fact]
    public async Task Another_departments_students_answer_404()
    {
        var (_, admin) = await DepartmentAsync();
        var outsider = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);

        Fails(await PatchAsync($"/api/v1/students/{outsider.UserId}", new { firstName = "Mine" }, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PutAsync($"/api/v1/students/{outsider.UserId}/class-representative", null, admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await DeleteAsync($"/api/v1/students/{outsider.UserId}/class-representative", admin), HttpStatusCode.NotFound, "NOT_FOUND");
        Fails(await PostAsync("/api/v1/students",
            new { phone = Seed.RandomPhone(), firstName = "A", lastName = "B", studentId = "S-OUT", sectionId = outsider.SectionId }, admin),
            HttpStatusCode.NotFound, "NOT_FOUND");
        Assert.Empty(Ok(await GetAsync($"/api/v1/students?sectionId={outsider.SectionId}", admin)).EnumerateArray());
        Assert.Equal("Ada", await Seed.ScalarAsync<string>(Db.ConnectionString, """SELECT first_name FROM "user".profile WHERE user_id = @id""", Ct,
            ("id", outsider.UserId)));
    }

    // ---------------------------------------------------------------- import

    [Fact]
    public async Task Import_creates_then_is_idempotent_then_updates()
    {
        var (placement, admin) = await DepartmentAsync();
        var p1 = Seed.RandomPhone();
        var p2 = Seed.RandomPhone();
        var tag = Guid.NewGuid().ToString("N")[..6];
        object[] RowList(string lastName) =>
        [
            new { phone = Local(p1), firstName = "Ayesha", lastName, studentId = $"I1-{tag}", batch = "2026", section = "a" },
            new { phone = p2, firstName = "Badhon", lastName = "Roy", studentId = $"I2-{tag}", sectionId = placement.SectionId },
        ];
        object Rows(string lastName) => new { rows = RowList(lastName) };

        // Dry run: counts, nothing written.
        var dry = Ok(await PostAsync("/api/v1/students/import", new { rows = RowList("Siddika"), dryRun = true }, admin));
        Assert.Equal(2, dry.GetProperty("created").GetInt32());
        Assert.True(dry.GetProperty("dryRun").GetBoolean());
        Assert.Equal(0, await CountAsync("""SELECT count(*) FROM "user".account WHERE phone IN (@a, @b)""", ("a", p1), ("b", p2)));

        var first = Ok(await PostAsync("/api/v1/students/import", Rows("Siddika"), admin));
        Assert.Equal(2, first.GetProperty("created").GetInt32());
        Assert.Equal(2, await CountAsync("""
            SELECT count(*) FROM "user".account a JOIN "user".profile p ON p.user_id = a.id
            WHERE a.phone IN (@a, @b) AND a.role = 'student' AND p.section_id = @s AND p.department_id = @d
            """, ("a", p1), ("b", p2), ("s", placement.SectionId), ("d", placement.DepartmentId)));

        var again = Ok(await PostAsync("/api/v1/students/import", Rows("Siddika"), admin));
        Assert.Equal(2, again.GetProperty("unchanged").GetInt32());
        Assert.Equal(0, again.GetProperty("created").GetInt32());

        var changed = Ok(await PostAsync("/api/v1/students/import", Rows("Siddiqua"), admin));
        Assert.Equal(1, changed.GetProperty("updated").GetInt32());
        Assert.Equal("Siddiqua", await Seed.ScalarAsync<string>(Db.ConnectionString, """
            SELECT p.last_name FROM "user".profile p JOIN "user".account a ON a.id = p.user_id WHERE a.phone = @p
            """, Ct, ("p", p1)));

        // Imported students can sign in.
        await AccessTokenAsync(p2);
    }

    [Fact]
    public async Task Import_reports_every_bad_row_and_writes_nothing()
    {
        var (_, admin) = await DepartmentAsync();
        var good = Seed.RandomPhone();
        var teacher = Seed.RandomPhone();
        Ok(await PostAsync("/api/v1/teachers", new { phone = teacher, firstName = "T", lastName = "T" }, admin), HttpStatusCode.Created);
        var outsider = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);

        var result = Fails(await PostAsync("/api/v1/students/import", new
        {
            rows = new object[]
            {
                new { phone = good, firstName = "Good", lastName = "Row", studentId = "G-" + Guid.NewGuid().ToString("N")[..8], batch = "2026", section = "A" },
                new { phone = "12345", firstName = "", lastName = "X", studentId = "bad id", batch = "2026", section = "A" },
                new { phone = good, firstName = "Dup", lastName = "Licate", studentId = "D-1", batch = "2026", section = "A" },
                new { phone = Seed.RandomPhone(), firstName = "No", lastName = "Section", studentId = "N-1", batch = "1999", section = "Z" },
                new { phone = teacher, firstName = "Is", lastName = "Teacher", studentId = "T-1", batch = "2026", section = "A" },
                new { phone = outsider.Phone, firstName = "Other", lastName = "Dept", studentId = "O-1", batch = "2026", section = "A" },
            },
        }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");

        var details = result.GetProperty("details");
        Assert.Equal(5, details.GetProperty("failed").GetInt32());
        var rows = details.GetProperty("rows").EnumerateArray().ToList();
        Assert.Equal("created", rows[0].GetProperty("outcome").GetString()); // would have been
        var errors = rows.Skip(1).Select(r => r.GetProperty("errors")).ToList();
        Assert.True(errors[0].TryGetProperty("phone", out _) && errors[0].TryGetProperty("firstName", out _) && errors[0].TryGetProperty("studentId", out _));
        Assert.Contains("row 1", errors[1].GetProperty("phone").GetString());
        Assert.True(errors[2].TryGetProperty("section", out _));
        Assert.Contains("teacher", errors[3].GetProperty("phone").GetString());
        Assert.Contains("another department", errors[4].GetProperty("phone").GetString());

        Assert.Equal(0, await CountAsync("""SELECT count(*) FROM "user".account WHERE phone = @p""", ("p", good)));
        Fails(await PostAsync("/api/v1/students/import", new { rows = Array.Empty<object>() }, admin), HttpStatusCode.BadRequest, "VALIDATION_FAILED");
    }
}
