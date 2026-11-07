using System.Net;
using System.Text.Json;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

[Collection(DatabaseTests.Name)]
public sealed class AccessRequestTests(PostgresFixture db) : ApiTestBase(db)
{
    private static object Form(string phone, string code, Guid sectionId, string? studentId = null) => new
    {
        phone,
        code,
        firstName = "Nadia",
        lastName = "Karim",
        studentId = studentId ?? "S-" + Guid.NewGuid().ToString("N")[..10],
        sectionId,
    };

    /// <summary>Requests a verification code and submits the form; returns the new request's id.</summary>
    private async Task<Guid> SubmitAsync(string phone, Guid sectionId, string? studentId = null)
    {
        var (codeStatus, _) = await PostAsync("/api/v1/access-requests/code", new { phone });
        Assert.Equal(HttpStatusCode.OK, codeStatus);
        var (status, body) = await PostAsync("/api/v1/access-requests", Form(phone, Factory.Sms.LastCodeFor(phone), sectionId, studentId));
        Assert.Equal(HttpStatusCode.Created, status);
        return body.GetProperty("data").GetProperty("id").GetGuid();
    }

    private async Task<string> AdminTokenAsync(Guid? departmentId) =>
        await AccessTokenAsync(await Seed.AdminAsync(Db.ConnectionString, departmentId, Ct));

    [Fact]
    public async Task The_directory_lists_open_departments_batches_and_sections()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        await Seed.ExecuteAsync(Db.ConnectionString, "INSERT INTO academic.section (name, batch_id, is_active) VALUES ('Closed', @b, false)", Ct,
            ("b", placement.BatchId));

        var (status, body) = await GetAsync("/api/v1/directory");
        Assert.Equal(HttpStatusCode.OK, status);

        var department = body.GetProperty("data").EnumerateArray().Single(d => d.GetProperty("id").GetGuid() == placement.DepartmentId);
        var batch = department.GetProperty("batches").EnumerateArray().Single();
        var sections = batch.GetProperty("sections").EnumerateArray().Select(s => s.GetProperty("name").GetString()).ToList();
        Assert.Equal(["A"], sections); // the inactive section is hidden
    }

    [Fact]
    public async Task Request_to_approval_to_sign_in_end_to_end()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AdminTokenAsync(placement.DepartmentId);
        var phone = Seed.RandomPhone();

        // Not on the roster: sign-in says so, and the student asks to join.
        Assert.Equal("PHONE_NOT_REGISTERED", ErrorCode((await PostAsync("/api/v1/auth/code", new { phone })).Body));
        var requestId = await SubmitAsync(phone, placement.SectionId, studentId: "CSE-2026-001");

        // The admin sees it in the queue, with names resolved.
        var (listStatus, list) = await GetAsync("/api/v1/access-requests", admin);
        Assert.Equal(HttpStatusCode.OK, listStatus);
        var item = list.GetProperty("data").EnumerateArray().Single(r => r.GetProperty("id").GetGuid() == requestId);
        Assert.Equal("pending", item.GetProperty("status").GetString());
        Assert.Equal("A", item.GetProperty("section").GetProperty("name").GetString());
        Assert.Equal("2026", item.GetProperty("batch").GetProperty("name").GetString());

        var (approveStatus, approved) = await PostAsync($"/api/v1/access-requests/{requestId}/approve", null, admin);
        Assert.Equal(HttpStatusCode.OK, approveStatus);
        Assert.Equal("approved", approved.GetProperty("data").GetProperty("status").GetString());

        // The account and profile exist with the requested placement.
        var role = await Seed.ScalarAsync<string>(Db.ConnectionString, """SELECT role FROM "user".account WHERE phone = @p""", Ct, ("p", phone));
        Assert.Equal("student", role);
        var section = await Seed.ScalarAsync<Guid>(Db.ConnectionString,
            """SELECT p.section_id FROM "user".profile p JOIN "user".account a ON a.id = p.user_id WHERE a.phone = @p AND p.student_id = 'CSE-2026-001'""", Ct, ("p", phone));
        Assert.Equal(placement.SectionId, section);
        var linked = await Seed.ScalarAsync<bool>(Db.ConnectionString,
            """SELECT account_id IS NOT NULL FROM "user".access_request WHERE id = @id""", Ct, ("id", requestId));
        Assert.True(linked);

        // The student was told, and can now sign in normally.
        Assert.Contains(Factory.Sms.Sent, m => m.Phone == phone && m.Message.Contains("approved", StringComparison.Ordinal));
        var token = await AccessTokenAsync(phone);
        var (_, me) = await GetAsync("/api/v1/me", token);
        Assert.Equal("Nadia", me.GetProperty("data").GetProperty("firstName").GetString());
        Assert.Equal(placement.SectionId, me.GetProperty("data").GetProperty("section").GetProperty("id").GetGuid());
    }

    [Fact]
    public async Task A_rostered_number_is_told_to_sign_in_instead_and_gets_no_sms()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var (status, body) = await PostAsync("/api/v1/access-requests/code", new { phone = student.Phone });
        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("ALREADY_REGISTERED", ErrorCode(body));
        Assert.DoesNotContain(Factory.Sms.Sent, m => m.Phone == student.Phone);
    }

    [Fact]
    public async Task A_wrong_code_creates_nothing()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var phone = Seed.RandomPhone();
        await PostAsync("/api/v1/access-requests/code", new { phone });
        var wrong = Factory.Sms.LastCodeFor(phone) == "000000" ? "111111" : "000000";

        var (status, body) = await PostAsync("/api/v1/access-requests", Form(phone, wrong, placement.SectionId));
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("INVALID_CODE", ErrorCode(body));
        var count = await Seed.ScalarAsync<long>(Db.ConnectionString, """SELECT count(*) FROM "user".access_request WHERE phone = @p""", Ct, ("p", phone));
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task A_sign_in_code_does_not_work_for_a_request()
    {
        // Codes are bound to their purpose: a LOGIN code can't verify an access request.
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        await PostAsync("/api/v1/auth/code", new { phone = student.Phone });
        var loginCode = Factory.Sms.LastCodeFor(student.Phone);
        await Seed.ExecuteAsync(Db.ConnectionString, """DELETE FROM "user".account WHERE id = @id""", Ct, ("id", student.UserId));

        var (status, body) = await PostAsync("/api/v1/access-requests", Form(student.Phone, loginCode, placement.SectionId));
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("INVALID_CODE", ErrorCode(body));
    }

    [Fact]
    public async Task Only_one_open_request_per_phone_and_no_sms_for_a_second()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var phone = Seed.RandomPhone();
        await SubmitAsync(phone, placement.SectionId);
        var smsBefore = Factory.Sms.Sent.Count(m => m.Phone == phone);

        var (status, body) = await PostAsync("/api/v1/access-requests/code", new { phone });
        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("REQUEST_PENDING", ErrorCode(body));
        Assert.Equal(smsBefore, Factory.Sms.Sent.Count(m => m.Phone == phone));
    }

    [Fact]
    public async Task Missing_fields_are_reported_per_field()
    {
        var phone = Seed.RandomPhone();
        var (status, body) = await PostAsync("/api/v1/access-requests", new { phone, code = "12" });
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("VALIDATION_FAILED", ErrorCode(body));
        var details = body.GetProperty("error").GetProperty("details");
        foreach (var field in new[] { "firstName", "lastName", "studentId", "sectionId", "code" })
        {
            Assert.True(details.TryGetProperty(field, out _), $"missing error for {field}");
        }
    }

    [Fact]
    public async Task A_closed_or_unknown_section_is_refused_before_the_code_is_used()
    {
        var phone = Seed.RandomPhone();
        await PostAsync("/api/v1/access-requests/code", new { phone });
        var code = Factory.Sms.LastCodeFor(phone);

        var (status, body) = await PostAsync("/api/v1/access-requests", Form(phone, code, Guid.NewGuid()));
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("INVALID_SECTION", ErrorCode(body));

        // The code wasn't burned: the same code still works with a real section.
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var (retry, _) = await PostAsync("/api/v1/access-requests", Form(phone, code, placement.SectionId));
        Assert.Equal(HttpStatusCode.Created, retry);
    }

    [Fact]
    public async Task A_student_id_already_on_the_roster_is_refused()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var existing = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var takenId = await Seed.ScalarAsync<string>(Db.ConnectionString,
            """SELECT student_id FROM "user".profile WHERE user_id = @u""", Ct, ("u", existing.UserId));

        var phone = Seed.RandomPhone();
        await PostAsync("/api/v1/access-requests/code", new { phone });
        var (status, body) = await PostAsync("/api/v1/access-requests", Form(phone, Factory.Sms.LastCodeFor(phone), placement.SectionId, takenId));
        Assert.Equal(HttpStatusCode.Conflict, status);
        Assert.Equal("STUDENT_ID_TAKEN", ErrorCode(body));
    }

    [Fact]
    public async Task Only_department_admins_reach_the_queue()
    {
        var student = await Seed.StudentAsync(Db.ConnectionString, ct: Ct);
        var studentToken = await AccessTokenAsync(student.Phone);
        var unscopedAdmin = await AdminTokenAsync(null);

        Assert.Equal(HttpStatusCode.Unauthorized, (await GetAsync("/api/v1/access-requests")).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await GetAsync("/api/v1/access-requests", studentToken)).Status);

        var (status, body) = await GetAsync("/api/v1/access-requests", unscopedAdmin);
        Assert.Equal(HttpStatusCode.Forbidden, status);
        Assert.Equal("FORBIDDEN", ErrorCode(body));
    }

    [Fact]
    public async Task Admins_cannot_see_or_decide_another_departments_requests()
    {
        var mine = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var theirs = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AdminTokenAsync(mine.DepartmentId);
        var otherRequest = await SubmitAsync(Seed.RandomPhone(), theirs.SectionId);

        var (_, list) = await GetAsync("/api/v1/access-requests?status=all", admin);
        Assert.DoesNotContain(list.GetProperty("data").EnumerateArray(), r => r.GetProperty("id").GetGuid() == otherRequest);

        Assert.Equal(HttpStatusCode.NotFound, (await PostAsync($"/api/v1/access-requests/{otherRequest}/approve", null, admin)).Status);
        Assert.Equal(HttpStatusCode.NotFound, (await PostAsync($"/api/v1/access-requests/{otherRequest}/reject", new { }, admin)).Status);
        var status = await Seed.ScalarAsync<string>(Db.ConnectionString, """SELECT status FROM "user".access_request WHERE id = @id""", Ct, ("id", otherRequest));
        Assert.Equal("pending", status);
    }

    [Fact]
    public async Task Rejection_records_the_reason_tells_the_student_and_allows_a_new_request()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AdminTokenAsync(placement.DepartmentId);
        var phone = Seed.RandomPhone();
        var requestId = await SubmitAsync(phone, placement.SectionId);

        var (status, body) = await PostAsync($"/api/v1/access-requests/{requestId}/reject", new { reason = "Not enrolled this semester" }, admin);
        Assert.Equal(HttpStatusCode.OK, status);
        var data = body.GetProperty("data");
        Assert.Equal("rejected", data.GetProperty("status").GetString());
        Assert.Equal("Not enrolled this semester", data.GetProperty("rejectionReason").GetString());
        Assert.Contains(Factory.Sms.Sent, m => m.Phone == phone && m.Message.Contains("Not enrolled this semester", StringComparison.Ordinal));

        // No account was created, and the student may ask again.
        var accounts = await Seed.ScalarAsync<long>(Db.ConnectionString, """SELECT count(*) FROM "user".account WHERE phone = @p""", Ct, ("p", phone));
        Assert.Equal(0, accounts);
        Assert.Equal(HttpStatusCode.OK, (await PostAsync("/api/v1/access-requests/code", new { phone })).Status);
    }

    [Fact]
    public async Task A_request_can_be_decided_only_once()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AdminTokenAsync(placement.DepartmentId);
        var requestId = await SubmitAsync(Seed.RandomPhone(), placement.SectionId);

        Assert.Equal(HttpStatusCode.OK, (await PostAsync($"/api/v1/access-requests/{requestId}/approve", null, admin)).Status);

        var (again, body) = await PostAsync($"/api/v1/access-requests/{requestId}/approve", null, admin);
        Assert.Equal(HttpStatusCode.Conflict, again);
        Assert.Equal("ALREADY_DECIDED", ErrorCode(body));
        Assert.Equal("ALREADY_DECIDED", ErrorCode((await PostAsync($"/api/v1/access-requests/{requestId}/reject", new { }, admin)).Body));
    }

    [Fact]
    public async Task Parallel_approvals_create_exactly_one_account()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AdminTokenAsync(placement.DepartmentId);
        var phone = Seed.RandomPhone();
        var requestId = await SubmitAsync(phone, placement.SectionId);

        var results = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ =>
            PostAsync($"/api/v1/access-requests/{requestId}/approve", null, admin)));

        Assert.Equal(1, results.Count(r => r.Status == HttpStatusCode.OK));
        Assert.All(results.Where(r => r.Status != HttpStatusCode.OK), r => Assert.Equal(HttpStatusCode.Conflict, r.Status));
        var accounts = await Seed.ScalarAsync<long>(Db.ConnectionString, """SELECT count(*) FROM "user".account WHERE phone = @p""", Ct, ("p", phone));
        Assert.Equal(1, accounts);
    }

    [Fact]
    public async Task The_queue_rejects_an_unknown_status_filter()
    {
        var placement = await Seed.PlacementAsync(Db.ConnectionString, Ct);
        var admin = await AdminTokenAsync(placement.DepartmentId);
        var (status, body) = await GetAsync("/api/v1/access-requests?status=everything", admin);
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("VALIDATION_FAILED", ErrorCode(body));
        _ = body.GetProperty("error").GetProperty("message").GetString();
    }
}
