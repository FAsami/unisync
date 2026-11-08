using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using UniSync.Api.Tests.Infrastructure;

namespace UniSync.Api.Tests;

/// <summary>
/// The committed api/openapi/v1.json is the contract the apps' generated clients
/// are built from. These tests fail when the code and that file drift apart, or
/// when an endpoint doesn't document its response.
///
/// To accept an intended change: UPDATE_OPENAPI=1 dotnet test --filter OpenApiContractTests,
/// then regenerate the clients (mobile: yarn api:types).
/// </summary>
public sealed class OpenApiContractTests
{
    private static readonly JsonSerializerOptions Indented = new() { WriteIndented = true };

    private static string SpecPath([CallerFilePath] string here = "") =>
        Path.GetFullPath(Path.Combine(Path.GetDirectoryName(here)!, "..", "..", "openapi", "v1.json"));

    private static async Task<JsonNode> GenerateAsync()
    {
        // The document needs no database; the connection string is never opened.
        await using var factory = new ApiFactory("Host=unused;Database=unused");
        using var client = factory.CreateClient();
        var json = await client.GetStringAsync(new Uri("/openapi/v1.json", UriKind.Relative), TestContext.Current.CancellationToken);
        var node = JsonNode.Parse(json)!;
        node.AsObject().Remove("servers"); // depends on the host serving the document
        return node;
    }

    [Fact]
    public void No_two_public_types_share_a_name()
    {
        // OpenAPI schema names are the short type name, so two records called
        // RoomBody in different namespaces silently share one schema and one of
        // the endpoints is documented with the other's body.
        var clashes = typeof(Program).Assembly.GetExportedTypes()
            .GroupBy(t => t.Name)
            .Where(g => g.Count() > 1)
            .Select(g => $"{g.Key}: {string.Join(", ", g.Select(t => t.FullName))}")
            .ToList();
        Assert.Empty(clashes);
    }

    [Fact]
    public async Task The_committed_spec_matches_the_code()
    {
        var generated = (await GenerateAsync()).ToJsonString(Indented) + "\n";
        var path = SpecPath();

        if (Environment.GetEnvironmentVariable("UPDATE_OPENAPI") == "1")
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            await File.WriteAllTextAsync(path, generated, TestContext.Current.CancellationToken);
            return;
        }

        Assert.True(File.Exists(path), $"Missing {path}. Run: UPDATE_OPENAPI=1 dotnet test --filter OpenApiContractTests");
        var committed = await File.ReadAllTextAsync(path, TestContext.Current.CancellationToken);
        Assert.True(committed.ReplaceLineEndings("\n") == generated,
            "api/openapi/v1.json is out of date. Run: UPDATE_OPENAPI=1 dotnet test --filter OpenApiContractTests, then regenerate the app clients.");
    }

    [Fact]
    public void Public_types_have_unique_names()
    {
        // OpenAPI schema ids are the short type name: two records both called
        // RoomBody silently became one schema, and one endpoint documented the
        // other's body. Name request and response types uniquely.
        var duplicates = typeof(Program).Assembly.GetExportedTypes()
            .GroupBy(t => t.Name)
            .Where(g => g.Count() > 1)
            .Select(g => $"{g.Key} ({string.Join(", ", g.Select(t => t.Namespace))})")
            .ToList();

        Assert.True(duplicates.Count == 0, "Rename one of: " + string.Join("; ", duplicates));
    }

    [Fact]
    public async Task Every_endpoint_documents_its_success_envelope()
    {
        var paths = (await GenerateAsync())["paths"]!.AsObject();
        var undocumented = new List<string>();
        foreach (var (path, item) in paths)
        {
            foreach (var (method, operation) in item!.AsObject())
            {
                var responses = operation!["responses"]?.AsObject();
                var success = responses?.FirstOrDefault(r => r.Key.StartsWith('2')).Value;
                if (success?["content"]?["application/json"]?["schema"] is null)
                {
                    undocumented.Add($"{method.ToUpperInvariant()} {path}");
                }
            }
        }

        Assert.True(undocumented.Count == 0, "Add .Returns<T>() to: " + string.Join(", ", undocumented));
    }
}
