using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using UniSync.Api.Data;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>
/// The API owns the schema: it builds an empty database from nothing, and adopts
/// a database Hasura already built without re-running the baseline.
/// </summary>
[Collection(DatabaseTests.Name)]
public sealed class MigrationTests
{
    private readonly PostgresFixture _db;

    public MigrationTests(PostgresFixture db)
    {
        _db = db;
        Assert.SkipWhen(db.Unavailable, "Set UNISYNC_TEST_DB to run database tests.");
    }

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    private static MigrationRunner Runner(NpgsqlDataSource dataSource) => new(dataSource, NullLogger<MigrationRunner>.Instance);

    private static IReadOnlyList<string> AllNames => [.. MigrationRunner.LoadEmbedded().Select(m => m.Name)];

    [Fact]
    public async Task An_empty_database_is_built_from_the_baseline_up()
    {
        await using var dataSource = NpgsqlDataSource.Create(await _db.CreateEmptyDatabaseAsync());

        var applied = await Runner(dataSource).ApplyPendingAsync(Ct);

        Assert.Equal(MigrationRunner.BaselineName, applied[0]);
        Assert.Equal(AllNames, applied);
        Assert.Equal(AllNames, await RecordedAsync(dataSource));
        Assert.True(await ScalarAsync<bool>(dataSource, "SELECT to_regclass('user.access_request') IS NOT NULL"));
        Assert.Empty(await Runner(dataSource).ApplyPendingAsync(Ct));
    }

    [Fact]
    public async Task A_database_hasura_built_is_adopted_without_rerunning_the_baseline()
    {
        await using var dataSource = NpgsqlDataSource.Create(await _db.CreateEmptyDatabaseAsync());
        await ExecuteBaselineAsync(dataSource); // what Hasura's migrations left behind

        var applied = await Runner(dataSource).ApplyPendingAsync(Ct);

        Assert.DoesNotContain(MigrationRunner.BaselineName, applied);
        Assert.Equal(AllNames.Skip(1), applied);
        Assert.Equal(AllNames, await RecordedAsync(dataSource));
    }

    [Fact]
    public async Task A_half_built_hasura_schema_is_refused()
    {
        await using var dataSource = NpgsqlDataSource.Create(await _db.CreateEmptyDatabaseAsync());
        await ExecuteBaselineAsync(dataSource);
        await ScalarAsync<object>(dataSource, """ALTER TABLE "user".account DROP COLUMN deleted_at""");

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() => Runner(dataSource).ApplyPendingAsync(Ct));
        Assert.Contains("deleted_at", error.Message, StringComparison.Ordinal);
        Assert.False(await ScalarAsync<bool>(dataSource, "SELECT to_regclass('api.schema_migrations') IS NOT NULL"));
    }

    private static async Task ExecuteBaselineAsync(NpgsqlDataSource dataSource)
    {
        var baseline = MigrationRunner.LoadEmbedded().Single(m => m.Name == MigrationRunner.BaselineName).Sql;
        await using var connection = await dataSource.OpenConnectionAsync(Ct);
        await using var transaction = await connection.BeginTransactionAsync(Ct);
        await using (var command = new NpgsqlCommand(baseline, connection, transaction))
        {
            await command.ExecuteNonQueryAsync(Ct);
        }

        await transaction.CommitAsync(Ct);
    }

    private static async Task<List<string>> RecordedAsync(NpgsqlDataSource dataSource)
    {
        await using var command = dataSource.CreateCommand("SELECT name FROM api.schema_migrations ORDER BY name");
        await using var reader = await command.ExecuteReaderAsync(Ct);
        var names = new List<string>();
        while (await reader.ReadAsync(Ct))
        {
            names.Add(reader.GetString(0));
        }

        return names;
    }

    private static async Task<T> ScalarAsync<T>(NpgsqlDataSource dataSource, string sql)
    {
        await using var command = dataSource.CreateCommand(sql);
        return (T)(await command.ExecuteScalarAsync(Ct))!;
    }
}
