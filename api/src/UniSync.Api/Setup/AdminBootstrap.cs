using Microsoft.EntityFrameworkCore;
using UniSync.Api.Auth;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

/// <summary>
/// <c>dotnet UniSync.Api.dll create-admin --phone 01712345678 --first-name Ada --last-name Rahman
/// --department-code CSE --department-name "Computer Science and Engineering"</c>
///
/// Creates the department if its code is new, and makes the phone's account a
/// department admin managing it (creating the account if needed). Safe to run
/// again. This is the only way to create the first admin: departments are
/// otherwise set up by their own admins, and there is no university-wide role.
/// </summary>
public static class AdminBootstrap
{
    public const string Command = "create-admin";

    private static readonly string[] RequiredOptions = ["phone", "first-name", "last-name", "department-code"];

    public sealed record Result(bool Ok, string Message);

    public static async Task<Result> RunAsync(IServiceProvider services, string[] args, CancellationToken ct = default)
    {
        var options = Parse(args);
        string Opt(string name) => options.TryGetValue(name, out var v) ? v.Trim() : "";

        var missing = RequiredOptions.Where(n => Opt(n).Length == 0).ToList();
        if (missing.Count > 0)
        {
            return new(false, $"Missing --{string.Join(", --", missing)}. Usage: create-admin --phone 017XXXXXXXX --first-name F "
                + "--last-name L --department-code CSE [--department-name \"Computer Science\"]");
        }

        if (!PhoneNumber.TryNormalize(Opt("phone"), out var phone))
        {
            return new(false, "--phone must be a Bangladeshi mobile number, like 01712345678.");
        }

        var code = Opt("department-code").ToUpperInvariant();
        if (!DepartmentEndpoints.CodePattern().IsMatch(code))
        {
            return new(false, "--department-code must be 2–16 letters, numbers or dashes, like CSE.");
        }

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<UniSyncDbContext>();
        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var notes = new List<string>();
        var department = await db.Departments.FirstOrDefaultAsync(d => d.Code == code, ct);
        if (department is null)
        {
            var name = Opt("department-name");
            if (name.Length == 0)
            {
                return new(false, $"Department {code} doesn't exist yet. Add --department-name to create it.");
            }

            department = new Department { Id = Guid.NewGuid(), Code = code, Name = name, IsActive = true };
            db.Departments.Add(department);
            await db.SaveChangesAsync(ct); // before the account that references it (no navigation to order the inserts)
            notes.Add($"created department {code}");
        }

        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Phone == phone, ct);
        if (account is { DeletedAt: not null })
        {
            return new(false, "That number's account was deleted. Use another number.");
        }

        if (account is null)
        {
            account = new Account { Id = Guid.NewGuid(), Phone = phone, IsActive = true };
            db.Accounts.Add(account);
            notes.Add("created the account");
        }
        else if (account.Role != "admin")
        {
            notes.Add($"changed the account's role from {account.Role} to admin");
        }

        account.Role = "admin";
        account.IsActive = true;
        account.ManagedDepartmentId = department.Id;

        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == account.Id, ct);
        if (profile is null)
        {
            db.Profiles.Add(new Profile
            {
                UserId = account.Id, FirstName = Opt("first-name"), LastName = Opt("last-name"), DepartmentId = department.Id,
            });
        }
        else
        {
            profile.FirstName = Opt("first-name");
            profile.LastName = Opt("last-name");
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var summary = notes.Count == 0 ? "already set up" : string.Join(", ", notes);
        return new(true, $"{phone} is the admin of {department.Code} ({summary}). They sign in on web with this number.");
    }

    private static Dictionary<string, string> Parse(string[] args)
    {
        var options = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < args.Length - 1; i++)
        {
            if (args[i].StartsWith("--", StringComparison.Ordinal))
            {
                options[args[i][2..]] = args[i + 1];
                i++;
            }
        }

        return options;
    }
}
