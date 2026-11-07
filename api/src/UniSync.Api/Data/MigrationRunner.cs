using System.Reflection;
using Npgsql;

namespace UniSync.Api.Data;

/// <summary>
/// Applies the SQL files in api/db/migrations (embedded in this assembly) in
/// name order, once each, recording them in api.schema_migrations.
///
/// The legacy Hasura migrations are the baseline and are NOT run here: in
/// existing environments Hasura already applied them. New schema changes go in
/// api/db/migrations only. Run with: <c>dotnet UniSync.Api.dll migrate</c>.
/// </summary>
public sealed partial class MigrationRunner(NpgsqlDataSource dataSource, ILogger<MigrationRunner> logger)
{
    // Arbitrary constant: serialises runners started by several machines at once.
    private const long AdvisoryLockKey = 0x556e6953796e63; // "UniSync"

    public async Task<IReadOnlyList<string>> ApplyPendingAsync(CancellationToken cancellationToken = default)
    {
        var migrations = LoadEmbedded();
        var applied = new List<string>();

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await ExecuteAsync(connection, transaction, $"SELECT pg_advisory_xact_lock({AdvisoryLockKey})", cancellationToken);
        await ExecuteAsync(connection, transaction, """
            CREATE SCHEMA IF NOT EXISTS api;
            CREATE TABLE IF NOT EXISTS api.schema_migrations (
                name text PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            );
            """, cancellationToken);

        var done = new HashSet<string>(StringComparer.Ordinal);
        await using (var select = new NpgsqlCommand("SELECT name FROM api.schema_migrations", connection, transaction))
        await using (var reader = await select.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
            {
                done.Add(reader.GetString(0));
            }
        }

        foreach (var (name, sql) in migrations)
        {
            if (done.Contains(name))
            {
                continue;
            }

            await ExecuteAsync(connection, transaction, sql, cancellationToken);
            await using var record = new NpgsqlCommand("INSERT INTO api.schema_migrations (name) VALUES (@name)", connection, transaction);
            record.Parameters.AddWithValue("name", name);
            await record.ExecuteNonQueryAsync(cancellationToken);

            LogApplied(logger, name);
            applied.Add(name);
        }

        await transaction.CommitAsync(cancellationToken);
        return applied;
    }

    internal static IReadOnlyList<(string Name, string Sql)> LoadEmbedded()
    {
        var assembly = Assembly.GetExecutingAssembly();
        return assembly.GetManifestResourceNames()
            .Where(n => n.StartsWith("migrations/", StringComparison.Ordinal) && n.EndsWith(".sql", StringComparison.Ordinal))
            .OrderBy(n => n, StringComparer.Ordinal)
            .Select(n =>
            {
                using var stream = assembly.GetManifestResourceStream(n)!;
                using var reader = new StreamReader(stream);
                return (n["migrations/".Length..], reader.ReadToEnd());
            })
            .ToList();
    }

    private static async Task ExecuteAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, string sql, CancellationToken ct)
    {
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        await command.ExecuteNonQueryAsync(ct);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Applied migration {Name}")]
    private static partial void LogApplied(ILogger logger, string name);
}
