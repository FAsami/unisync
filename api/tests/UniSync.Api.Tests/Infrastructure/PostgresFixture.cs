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
/// One throwaway database per test run, built only by this API's migrations
/// (0000_baseline is Hasura's schema), exactly as a fresh environment is.
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
    private readonly List<string> _extraDatabases = [];

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
        ConnectionString = await CreateDatabaseAsync(_databaseName);

        await using var dataSource = NpgsqlDataSource.Create(ConnectionString);
        await new MigrationRunner(dataSource, NullLogger<MigrationRunner>.Instance).ApplyPendingAsync();
    }

    /// <summary>An extra empty database, dropped with the fixture (for migration tests).</summary>
    public async Task<string> CreateEmptyDatabaseAsync()
    {
        var name = $"unisync_test_{Guid.NewGuid():N}";
        _extraDatabases.Add(name);
        return await CreateDatabaseAsync(name);
    }

    private async Task<string> CreateDatabaseAsync(string name)
    {
        await using (var admin = new NpgsqlConnection(_adminConnectionString))
        {
            await admin.OpenAsync();
            await using var create = new NpgsqlCommand($"CREATE DATABASE \"{name}\"", admin);
            await create.ExecuteNonQueryAsync();
        }

        return new NpgsqlConnectionStringBuilder(_adminConnectionString) { Database = name }.ConnectionString;
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
        foreach (var name in _extraDatabases.Append(_databaseName))
        {
            await using var drop = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{name}\" WITH (FORCE)", admin);
            await drop.ExecuteNonQueryAsync();
        }
    }
}
