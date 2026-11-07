using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using UniSync.Api.Data;

namespace UniSync.Api.Tests.Infrastructure;

/// <summary>Database tests join this collection; unit tests stay independent of the database.</summary>
[CollectionDefinition(Name)]
public sealed class DatabaseTests : ICollectionFixture<PostgresFixture>
{
    public const string Name = "database";
}

/// <summary>
/// One throwaway database per test run, built from the real schema: the legacy
/// Hasura migrations (the baseline) and then this API's own migrations.
///
/// UNISYNC_TEST_DB = an admin connection string, e.g.
///   Host=localhost;Port=5432;Username=postgres;Password=postgres;Database=postgres
/// Without it, database tests are skipped, unless UNISYNC_REQUIRE_DB=1 (set in
/// CI), which turns a missing database into a failure so tests never silently skip.
/// </summary>
public sealed class PostgresFixture : IAsyncLifetime
{
    private string? _adminConnectionString;
    private string? _databaseName;

    public bool Unavailable { get; private set; }

    public string ConnectionString { get; private set; } = "";

    public async ValueTask InitializeAsync()
    {
        _adminConnectionString = Environment.GetEnvironmentVariable("UNISYNC_TEST_DB");
        if (string.IsNullOrWhiteSpace(_adminConnectionString))
        {
            if (Environment.GetEnvironmentVariable("UNISYNC_REQUIRE_DB") == "1")
            {
                throw new InvalidOperationException("UNISYNC_REQUIRE_DB=1 but UNISYNC_TEST_DB is not set.");
            }

            Unavailable = true;
            return;
        }

        _databaseName = $"unisync_test_{Guid.NewGuid():N}";
        await using (var admin = new NpgsqlConnection(_adminConnectionString))
        {
            await admin.OpenAsync();
            await using var create = new NpgsqlCommand($"CREATE DATABASE \"{_databaseName}\"", admin);
            await create.ExecuteNonQueryAsync();
        }

        ConnectionString = new NpgsqlConnectionStringBuilder(_adminConnectionString) { Database = _databaseName }.ConnectionString;

        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await ApplyLegacyMigrationsAsync(dataSource);
        await new MigrationRunner(dataSource, NullLogger<MigrationRunner>.Instance).ApplyPendingAsync();
    }

    private static async Task ApplyLegacyMigrationsAsync(NpgsqlDataSource dataSource)
    {
        var root = Path.Combine(AppContext.BaseDirectory, "legacy-migrations");
        var files = Directory.GetFiles(root, "up.sql", SearchOption.AllDirectories)
            .OrderBy(f => Path.GetFileName(Path.GetDirectoryName(f)), StringComparer.Ordinal); // version prefix

        await using var connection = await dataSource.OpenConnectionAsync();
        foreach (var file in files)
        {
            // transaction_timeout exists from Postgres 17 (production); drop it so
            // older local servers can run the suite too.
            var sql = string.Join('\n', (await File.ReadAllLinesAsync(file))
                .Where(l => !l.Contains("transaction_timeout", StringComparison.Ordinal)));
            await using var command = new NpgsqlCommand(sql, connection);
            await command.ExecuteNonQueryAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_databaseName is null || _adminConnectionString is null)
        {
            return;
        }

        NpgsqlConnection.ClearAllPools();
        await using var admin = new NpgsqlConnection(_adminConnectionString);
        await admin.OpenAsync();
        await using var drop = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{_databaseName}\" WITH (FORCE)", admin);
        await drop.ExecuteNonQueryAsync();
    }
}
