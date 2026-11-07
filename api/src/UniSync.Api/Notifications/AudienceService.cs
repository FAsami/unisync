using Microsoft.EntityFrameworkCore;
using UniSync.Api.Data;

namespace UniSync.Api.Notifications;

public static class AudienceType
{
    public const string All = "all";
    public const string Department = "department";
    public const string Batch = "batch";
    public const string Section = "section";
    public const string User = "user";
}

public sealed record AudienceOption(string Type, Guid Id, string Label, int Recipients);

/// <summary>
/// The one definition of who is in an audience and who may address it. The inbox,
/// recipient counts and send permissions all use it, so they can't disagree.
/// </summary>
public sealed class AudienceService(UniSyncDbContext db)
{
    /// <summary>Active, non-deleted accounts in the audience.</summary>
    public IQueryable<Guid> Members(string type, Guid id)
    {
        var active = db.Accounts.Where(a => a.IsActive && a.DeletedAt == null);
        IQueryable<Guid> ids = type switch
        {
            AudienceType.Section => db.Profiles.Where(p => p.SectionId == id).Select(p => p.UserId),
            AudienceType.Batch => db.Profiles.Where(p => p.BatchId == id).Select(p => p.UserId),
            AudienceType.Department => db.Profiles.Where(p => p.DepartmentId == id).Select(p => p.UserId)
                .Union(db.TeacherProfiles.Where(t => t.DepartmentId == id).Select(t => t.UserId))
                .Union(db.Accounts.Where(a => a.ManagedDepartmentId == id).Select(a => a.Id)),
            AudienceType.User => db.Accounts.Where(a => a.Id == id).Select(a => a.Id),
            AudienceType.All => db.Accounts.Select(a => a.Id),
            _ => db.Accounts.Where(_ => false).Select(a => a.Id),
        };
        return active.Where(a => ids.Contains(a.Id)).Select(a => a.Id);
    }

    /// <summary>Notifications addressed to <paramref name="userId"/> through any audience they belong to.</summary>
    public async Task<IQueryable<NotificationLog>> InboxAsync(Guid userId, CancellationToken ct)
    {
        var profile = await db.Profiles.AsNoTracking().Where(p => p.UserId == userId)
            .Select(p => new { p.SectionId, p.BatchId, p.DepartmentId }).FirstOrDefaultAsync(ct);
        var departments = await db.TeacherProfiles.Where(t => t.UserId == userId).Select(t => t.DepartmentId)
            .Concat(db.Accounts.Where(a => a.Id == userId && a.ManagedDepartmentId != null).Select(a => a.ManagedDepartmentId!.Value))
            .ToListAsync(ct);
        if (profile is not null)
        {
            departments.Add(profile.DepartmentId);
        }

        var sectionId = profile?.SectionId;
        var batchId = profile?.BatchId;
        return db.Notifications.Where(n =>
            n.TargetType == AudienceType.All
            || (n.TargetType == AudienceType.User && n.TargetId == userId)
            || (n.TargetType == AudienceType.Section && sectionId != null && n.TargetId == sectionId)
            || (n.TargetType == AudienceType.Batch && batchId != null && n.TargetId == batchId)
            || (n.TargetType == AudienceType.Department && departments.Contains(n.TargetId)));
    }

    /// <summary>
    /// What this person may address: a department admin their department and its
    /// batches and sections; a teacher the sections they teach; a CR their section.
    /// </summary>
    public async Task<IReadOnlyList<AudienceOption>> AllowedAsync(Guid userId, string role, CancellationToken ct)
    {
        var options = new List<(string Type, Guid Id, string Label)>();

        if (role == "admin"
            && await db.Accounts.Where(a => a.Id == userId).Select(a => a.ManagedDepartmentId).FirstOrDefaultAsync(ct) is { } departmentId)
        {
            var department = await db.Departments.AsNoTracking().FirstAsync(d => d.Id == departmentId, ct);
            options.Add((AudienceType.Department, department.Id, department.Name));
            var batches = await db.Batches.AsNoTracking().Where(b => b.DepartmentId == departmentId && b.IsActive).OrderBy(b => b.Name).ToListAsync(ct);
            options.AddRange(batches.Select(b => (AudienceType.Batch, b.Id, $"Batch {b.Name} ({department.Code})")));
            options.AddRange(await SectionsAsync(db.Sections.Where(s => s.IsActive && batches.Select(b => b.Id).Contains(s.BatchId)), ct));
        }
        else if (role == "teacher")
        {
            var taught = db.CourseOfferings.Where(o => o.TeacherId == userId && o.IsActive).Select(o => o.SectionId);
            options.AddRange(await SectionsAsync(db.Sections.Where(s => s.IsActive && taught.Contains(s.Id)), ct));
        }
        else if (role is "student" or "class_representative")
        {
            var represented = db.ClassRepresentatives.Where(c => c.UserId == userId && c.IsActive).Select(c => c.SectionId);
            options.AddRange(await SectionsAsync(db.Sections.Where(s => s.IsActive && represented.Contains(s.Id)), ct));
        }

        var result = new List<AudienceOption>(options.Count);
        foreach (var (type, id, label) in options)
        {
            result.Add(new AudienceOption(type, id, label, await Members(type, id).CountAsync(ct)));
        }

        return result;
    }

    public async Task<string> LabelAsync(string? type, Guid id, CancellationToken ct) => type switch
    {
        AudienceType.All => "Everyone",
        AudienceType.Department => await db.Departments.Where(d => d.Id == id).Select(d => d.Name).FirstOrDefaultAsync(ct) ?? "A department",
        AudienceType.Batch => await db.Batches.Where(b => b.Id == id).Select(b => "Batch " + b.Name).FirstOrDefaultAsync(ct) ?? "A batch",
        AudienceType.Section => (await SectionsAsync(db.Sections.Where(s => s.Id == id), ct)).Select(s => s.Label).FirstOrDefault() ?? "A section",
        AudienceType.User => "You",
        _ => "Unknown audience",
    };

    private async Task<IReadOnlyList<(string Type, Guid Id, string Label)>> SectionsAsync(IQueryable<Section> sections, CancellationToken ct)
    {
        var rows = await (
            from s in sections
            join b in db.Batches on s.BatchId equals b.Id
            join d in db.Departments on b.DepartmentId equals d.Id
            orderby d.Code, b.Name, s.Name
            select new { s.Id, s.Name, Batch = b.Name, d.Code }).AsNoTracking().ToListAsync(ct);
        return [.. rows.Select(r => (AudienceType.Section, r.Id, $"Section {r.Name} · Batch {r.Batch} ({r.Code})"))];
    }
}
