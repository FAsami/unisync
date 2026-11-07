using System.Security.Cryptography;
using Npgsql;

namespace UniSync.Api.Tests.Infrastructure;

public sealed record SeededStudent(Guid UserId, string Phone, Guid SectionId, Guid BatchId, string SectionName);

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
