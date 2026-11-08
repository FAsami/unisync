using System.Reflection;
using Npgsql;

namespace UniSync.Api.Data;

/// <summary>
/// Applies the SQL files in api/db/migrations (embedded in this assembly) in
/// name order, once each, recording them in api.schema_migrations.
///
/// <c>0000_baseline.sql</c> is the schema Hasura's migrations built. Existing
/// environments already have it, so on a database where it is present but not
/// recorded the runner records it without running it (adopts it); on an empty
/// database it runs. Run with: <c>dotnet UniSync.Api.dll migrate</c>.
/// </summary>
public sealed partial class MigrationRunner(NpgsqlDataSource dataSource, ILogger<MigrationRunner> logger)
{
    // Arbitrary constant: serialises runners started by several machines at once.
    private const long AdvisoryLockKey = 0x556e6953796e63; // "UniSync"

    internal const string BaselineName = "0000_baseline.sql";

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

        if (!done.Contains(BaselineName) && await BaselinePresentAsync(connection, transaction, cancellationToken))
        {
            await RecordAsync(connection, transaction, BaselineName, cancellationToken);
            done.Add(BaselineName);
            LogAdopted(logger, BaselineName);
        }

        foreach (var (name, sql) in migrations)
        {
            if (done.Contains(name))
            {
                continue;
            }

            await ExecuteAsync(connection, transaction, sql, cancellationToken);
            await RecordAsync(connection, transaction, name, cancellationToken);

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

    /// <summary>
    /// True when Hasura's schema is already there. A database with only part of it
    /// (Hasura's second migration missing) is refused rather than guessed at.
    /// </summary>
    private static async Task<bool> BaselinePresentAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, CancellationToken ct)
    {
        await using var command = new NpgsqlCommand("""
            SELECT to_regclass('academic.department') IS NOT NULL,
                   EXISTS (SELECT 1 FROM information_schema.columns
                            WHERE table_schema = 'user' AND table_name = 'account' AND column_name = 'deleted_at')
            """, connection, transaction);
        bool tables, deletedAt;
        await using (var reader = await command.ExecuteReaderAsync(ct))
        {
            await reader.ReadAsync(ct);
            (tables, deletedAt) = (reader.GetBoolean(0), reader.GetBoolean(1));
        }

        if (tables && !deletedAt)
        {
            throw new InvalidOperationException(
                "The database has the baseline schema without user.account.deleted_at (Hasura's second migration). "
                + "Run: ALTER TABLE \"user\".account ADD COLUMN deleted_at timestamptz; then migrate again.");
        }

        return tables;
    }

    private static async Task RecordAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, string name, CancellationToken ct)
    {
        await using var record = new NpgsqlCommand("INSERT INTO api.schema_migrations (name) VALUES (@name)", connection, transaction);
        record.Parameters.AddWithValue("name", name);
        await record.ExecuteNonQueryAsync(ct);
    }

    private static async Task ExecuteAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, string sql, CancellationToken ct)
    {
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        await command.ExecuteNonQueryAsync(ct);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Applied migration {Name}")]
    private static partial void LogApplied(ILogger logger, string name);

    [LoggerMessage(Level = LogLevel.Information, Message = "Schema already present: recorded {Name} without running it")]
    private static partial void LogAdopted(ILogger logger, string name);
}
