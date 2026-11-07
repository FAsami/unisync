using System.Security.Cryptography;
using Npgsql;

namespace UniSync.Api.Tests.Infrastructure;

public sealed record SeededStudent(Guid UserId, string Phone, Guid SectionId, Guid BatchId, string SectionName);

public sealed record SeededPlacement(Guid DepartmentId, Guid BatchId, Guid SectionId);

/// <summary>Inserts roster data the way a department import will: an account with no password plus a profile.</summary>
public static class Seed
{
    public static string RandomPhone() =>
        "+8801" + RandomNumberGenerator.GetInt32(3, 10) + RandomNumberGenerator.GetInt32(0, 100_000_000).ToString("D8", System.Globalization.CultureInfo.InvariantCulture);

    public static async Task<SeededStudent> StudentAsync(string connectionString, string? phone = null, CancellationToken ct = default)
    {
        phone ??= RandomPhone();
        var suffix = Guid.NewGuid().ToString("N")[..8];

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var command = new NpgsqlCommand("""
            WITH f AS (INSERT INTO academic.faculty (name) VALUES ('Engineering ' || @s) RETURNING id),
                 d AS (INSERT INTO academic.department (code, name, faculty_id) SELECT 'CSE' || @s, 'Computer Science ' || @s, id FROM f RETURNING id),
                 b AS (INSERT INTO academic.batch (departmant_id, name, current_semester, year, semester_count) SELECT id, '2026', 1, 2026, 8 FROM d RETURNING id, departmant_id),
                 s AS (INSERT INTO academic.section (name, batch_id) SELECT 'A', id FROM b RETURNING id, batch_id),
                 a AS (INSERT INTO "user".account (phone, role) VALUES (@phone, 'student') RETURNING id),
                 p AS (INSERT INTO "user".profile (user_id, student_id, first_name, last_name, department_id, batch_id, section_id)
                       SELECT a.id, 'S' || @s, 'Ada', 'Rahman', b.departmant_id, b.id, s.id FROM a, b, s RETURNING user_id)
            SELECT p.user_id, s.id, s.batch_id FROM p, s
            """, connection);
        command.Parameters.AddWithValue("s", suffix);
        command.Parameters.AddWithValue("phone", phone);
        await using var reader = await command.ExecuteReaderAsync(ct);
        await reader.ReadAsync(ct);
        return new SeededStudent(reader.GetGuid(0), phone, reader.GetGuid(1), reader.GetGuid(2), "A");
    }

    /// <summary>A fresh active department with one batch ("2026") and one section ("A").</summary>
    public static async Task<SeededPlacement> PlacementAsync(string connectionString, CancellationToken ct = default)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var command = new NpgsqlCommand("""
            WITH d AS (INSERT INTO academic.department (code, name) VALUES ('D' || @s, 'Department ' || @s) RETURNING id),
                 b AS (INSERT INTO academic.batch (departmant_id, name, current_semester, year, semester_count) SELECT id, '2026', 1, 2026, 8 FROM d RETURNING id, departmant_id),
                 s AS (INSERT INTO academic.section (name, batch_id) SELECT 'A', id FROM b RETURNING id, batch_id)
            SELECT b.departmant_id, b.id, s.id FROM b, s
            """, connection);
        command.Parameters.AddWithValue("s", suffix);
        await using var reader = await command.ExecuteReaderAsync(ct);
        await reader.ReadAsync(ct);
        return new SeededPlacement(reader.GetGuid(0), reader.GetGuid(1), reader.GetGuid(2));
    }

    /// <summary>An account with role admin; <paramref name="managedDepartmentId"/> null = no department scope.</summary>
    public static async Task<string> AdminAsync(string connectionString, Guid? managedDepartmentId, CancellationToken ct = default)
    {
        var phone = RandomPhone();
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var command = new NpgsqlCommand(
            """INSERT INTO "user".account (phone, role, managed_department_id) VALUES (@phone, 'admin', @dept)""", connection);
        command.Parameters.AddWithValue("phone", phone);
        command.Parameters.AddWithValue("dept", (object?)managedDepartmentId ?? DBNull.Value);
        await command.ExecuteNonQueryAsync(ct);
        return phone;
    }

    /// <summary>A teacher account (role teacher + user.faculty row) in the batch's department.</summary>
    public static async Task<(Guid UserId, string Phone)> TeacherAsync(string connectionString, Guid batchId, string firstName, string lastName, CancellationToken ct = default)
    {
        var phone = RandomPhone();
        var id = await ScalarAsync<Guid>(connectionString, """
            WITH a AS (INSERT INTO "user".account (phone, role) VALUES (@phone, 'teacher') RETURNING id),
                 f AS (INSERT INTO academic.faculty (name) VALUES ('Faculty of Science') RETURNING id)
            INSERT INTO "user".faculty (first_name, last_name, designation, faculty_id, department_id, user_id)
            SELECT @first, @last, 'Lecturer', f.id, b.departmant_id, a.id FROM a, f, academic.batch b WHERE b.id = @batch
            RETURNING user_id
            """, ct, ("phone", phone), ("first", firstName), ("last", lastName), ("batch", batchId));
        return (id, phone);
    }

    /// <summary>A course (in the batch's department) offered to one section by one teacher.</summary>
    public static Task<Guid> OfferingAsync(string connectionString, string courseCode, Guid sectionId, Guid batchId, Guid teacherId, CancellationToken ct, bool active = true) =>
        ScalarAsync<Guid>(connectionString, """
            WITH c AS (INSERT INTO academic.course (department_id, code, name, credit_hours, semester)
                       SELECT departmant_id, @code, 'Course ' || @code, 3, 1 FROM academic.batch WHERE id = @batch RETURNING id)
            INSERT INTO academic.course_offering (course_id, batch_id, section_id, teacher_id, academic_year, is_active)
            SELECT c.id, @batch, @section, @teacher, '2026', @active FROM c RETURNING id
            """, ct, ("code", courseCode), ("batch", batchId), ("section", sectionId), ("teacher", teacherId), ("active", active));

    public static Task<Guid> RoomAsync(string connectionString, string roomNumber, string buildingName, CancellationToken ct = default) =>
        ScalarAsync<Guid>(connectionString, """
            WITH b AS (INSERT INTO venue.building (name, code, address) VALUES (@building, 'B' || substr(md5(random()::text), 1, 6), 'Campus') RETURNING id)
            INSERT INTO venue.room (building_id, room_number, floor, room_name) SELECT b.id, @room, '4', 'Room ' || @room FROM b RETURNING id
            """, ct, ("building", buildingName), ("room", roomNumber));

    /// <summary>
    /// A weekly class. Times are passed as text so tests can use the legacy
    /// "+06" spelling the mobile app still writes.
    /// </summary>
    public static Task<Guid> RoutineAsync(
        string connectionString, Guid offeringId, DayOfWeek day, string start, string end, CancellationToken ct,
        Guid? roomId = null, string? metadataRoom = null, string from = "2026-09-01", string to = "2027-01-31", bool active = true) =>
        ScalarAsync<Guid>(connectionString, """
            INSERT INTO event.routine (name, course_offering_id, day_of_week, start_time, end_time, effective_from, effective_to, is_active, room_id, metadata)
            VALUES ('class', @offering, @day, @start::time, @end::time, @from::date, @to::date, @active, @room,
                    CASE WHEN @meta::text IS NULL THEN NULL ELSE jsonb_build_object('room_number', @meta::text) END)
            RETURNING id
            """, ct, ("offering", offeringId), ("day", (int)day), ("start", start), ("end", end), ("from", from), ("to", to),
            ("active", active), ("room", (object?)roomId ?? DBNull.Value), ("meta", (object?)metadataRoom ?? DBNull.Value));

    public static Task ClassChangeAsync(
        string connectionString, Guid routineId, string date, string type, Guid createdBy, CancellationToken ct,
        string? newDate = null, string? newStart = null, string? newEnd = null, Guid? newRoomId = null, string reason = "Teacher unwell") =>
        ExecuteAsync(connectionString, """
            INSERT INTO event.routine_exception (routine_id, exception_date, type, reason, created_by, new_date, new_start_time, new_end_time, new_room_id)
            VALUES (@routine, @date::date, @type, @reason, @by, @newDate::date, @newStart::time, @newEnd::time, @newRoom)
            """, ct, ("routine", routineId), ("date", date), ("type", type), ("reason", reason), ("by", createdBy),
            ("newDate", (object?)newDate ?? DBNull.Value), ("newStart", (object?)newStart ?? DBNull.Value),
            ("newEnd", (object?)newEnd ?? DBNull.Value), ("newRoom", (object?)newRoomId ?? DBNull.Value));

    /// <summary>A notification.log row, as the legacy apps or the API write them.</summary>
    public static Task<Guid> NotificationAsync(
        string connectionString, string targetType, Guid targetId, Guid createdBy, string title, CancellationToken ct, DateTimeOffset? createdAt = null) =>
        ScalarAsync<Guid>(connectionString, """
            INSERT INTO notification.log (title, body, target_type, target_id, created_by, data, created_at)
            VALUES (@title, 'Body of ' || @title, @type, @target, @by, '{"type":"notice"}', COALESCE(@at, now()))
            RETURNING id
            """, ct, ("title", title), ("type", targetType), ("target", targetId), ("by", createdBy),
            ("at", (object?)createdAt ?? DBNull.Value));

    public static async Task ExecuteAsync(string connectionString, string sql, CancellationToken ct, params (string Name, object Value)[] parameters)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection);
        foreach (var (name, value) in parameters)
        {
            command.Parameters.AddWithValue(name, value);
        }

        await command.ExecuteNonQueryAsync(ct);
    }

    public static async Task<T?> ScalarAsync<T>(string connectionString, string sql, CancellationToken ct, params (string Name, object Value)[] parameters)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(ct);
        await using var command = new NpgsqlCommand(sql, connection);
        foreach (var (name, value) in parameters)
        {
            command.Parameters.AddWithValue(name, value);
        }

        return (T?)await command.ExecuteScalarAsync(ct);
    }
}
