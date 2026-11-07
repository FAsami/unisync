using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Data;

namespace UniSync.Api.Schedule;

public static class ClassStatus
{
    public const string Scheduled = "scheduled";
    public const string Cancelled = "cancelled";
    public const string RoomChanged = "room_changed";
    /// <summary>The class now happens here (MovedFrom says where it was).</summary>
    public const string Moved = "moved";
    /// <summary>Placeholder on the original slot (MovedTo says where it went).</summary>
    public const string MovedAway = "moved_away";
}

public sealed record CourseInfo(string Code, string Name);

public sealed record SectionInfo(Guid Id, string Name, string BatchName);

public sealed record Slot(DateOnly Date, TimeOnly Start, TimeOnly End);

public sealed record ClassOccurrence(
    Guid RoutineId,
    DateOnly Date,
    TimeOnly Start,
    TimeOnly End,
    string Status,
    string Kind,
    CourseInfo? Course,
    SectionInfo Section,
    string? Teacher,
    Guid? RoomId,
    string? Room,
    string? Note,
    Slot? MovedFrom,
    Slot? MovedTo)
{
    /// <summary>False for cancelled classes and moved-away placeholders.</summary>
    public bool Happens => Status is not (ClassStatus.Cancelled or ClassStatus.MovedAway);
}

/// <summary>Whose classes: a student's section, a teacher's offerings, or none (e.g. no section yet).</summary>
public static class ScheduleScope
{
    public const string Section = "section";
    public const string Teacher = "teacher";
    public const string None = "none";
}

/// <summary>
/// Expands weekly routines into dated class occurrences for one user and applies
/// that date's exception: cancellation, room change, or a move (which appears on
/// both the old slot, as moved_away, and the new one, as moved).
/// </summary>
public sealed class ScheduleService(UniSyncDbContext db)
{
    public async Task<(string Scope, IReadOnlyList<ClassOccurrence> Classes)> GetAsync(
        Guid userId, string role, DateOnly first, DateOnly last, CancellationToken ct)
    {
        IQueryable<CourseOffering> offerings = db.CourseOfferings.Where(o => o.IsActive);
        string scope;
        if (role == "teacher")
        {
            scope = ScheduleScope.Teacher;
            offerings = offerings.Where(o => o.TeacherId == userId);
        }
        else
        {
            var sectionId = await db.Profiles.Where(p => p.UserId == userId).Select(p => p.SectionId).FirstOrDefaultAsync(ct);
            if (sectionId is null || role is not ("student" or "class_representative"))
            {
                return (ScheduleScope.None, []);
            }

            scope = ScheduleScope.Section;
            offerings = offerings.Where(o => o.SectionId == sectionId);
        }

        return (scope, await ResolveAsync(offerings, first, last, ct));
    }

    /// <summary>Resolved classes for any set of offerings (a section, a teacher, a room's users).</summary>
    public async Task<IReadOnlyList<ClassOccurrence>> ResolveAsync(
        IQueryable<CourseOffering> offerings, DateOnly first, DateOnly last, CancellationToken ct)
    {
        var slots = await (
            from r in db.Routines
            join o in offerings on r.CourseOfferingId equals o.Id
            join s in db.Sections on o.SectionId equals s.Id
            join b in db.Batches on s.BatchId equals b.Id
            join c in db.Courses on o.CourseId equals c.Id into courses
            from c in courses.DefaultIfEmpty()
            join t in db.TeacherProfiles on o.TeacherId equals t.UserId into teachers
            from t in teachers.DefaultIfEmpty()
            where r.IsActive && r.EffectiveFrom <= last && r.EffectiveTo >= first
            select new
            {
                Routine = r,
                Course = c == null ? null : new CourseInfo(c.Code, c.Name),
                Section = new SectionInfo(s.Id, s.Name, b.Name),
                Teacher = t == null ? null : (t.FirstName + " " + t.LastName).Trim(),
            }).AsNoTracking().ToListAsync(ct);

        if (slots.Count == 0)
        {
            return [];
        }

        var routineIds = slots.Select(x => x.Routine.Id).ToList();
        var exceptions = await db.ClassChanges.AsNoTracking()
            .Where(e => e.RoutineId != null && routineIds.Contains(e.RoutineId.Value)
                && ((e.ExceptionDate >= first && e.ExceptionDate <= last)
                    || (e.Type == ClassChangeType.Reschedule && e.NewDate >= first && e.NewDate <= last)))
            .ToListAsync(ct);

        var roomIds = slots.Select(x => x.Routine.RoomId).Concat(exceptions.Select(e => e.NewRoomId))
            .OfType<Guid>().Distinct().ToList();
        var rooms = await (
            from r in db.Rooms
            join b in db.Buildings on r.BuildingId equals b.Id
            where roomIds.Contains(r.Id)
            select new { r.Id, Label = r.RoomNumber + ", " + b.Name }).AsNoTracking().ToDictionaryAsync(x => x.Id, x => x.Label, ct);

        var exceptionByOccurrence = exceptions.ToDictionary(e => (e.RoutineId!.Value, e.ExceptionDate));
        var result = new List<ClassOccurrence>();

        foreach (var slot in slots)
        {
            var r = slot.Routine;
            var room = RoomLabel(r, rooms);
            var roomId = r.RoomId;

            // Regular weekly occurrences inside the window and the routine's term.
            for (var day = Max(first, r.EffectiveFrom); day <= Min(last, r.EffectiveTo); day = day.AddDays(1))
            {
                if ((int)day.DayOfWeek != r.DayOfWeek)
                {
                    continue;
                }

                exceptionByOccurrence.TryGetValue((r.Id, day), out var ex);
                var occurrence = new ClassOccurrence(r.Id, day, r.StartTime, r.EndTime, ClassStatus.Scheduled, r.EventType,
                    slot.Course, slot.Section, slot.Teacher, roomId, room, null, null, null);

                result.Add(ex?.Type switch
                {
                    ClassChangeType.Cancellation => occurrence with { Status = ClassStatus.Cancelled, Note = ex.Reason },
                    ClassChangeType.RoomChange => occurrence with
                    {
                        Status = ClassStatus.RoomChanged,
                        RoomId = ex.NewRoomId,
                        Room = ex.NewRoomId is { } id && rooms.TryGetValue(id, out var label) ? label : room,
                        Note = ex.Reason,
                    },
                    ClassChangeType.Reschedule => occurrence with
                    {
                        Status = ClassStatus.MovedAway,
                        Note = ex.Reason,
                        MovedTo = new Slot(ex.NewDate!.Value, ex.NewStartTime!.Value, ex.NewEndTime!.Value),
                    },
                    _ => occurrence,
                });
            }

            // Moved occurrences landing inside the window (their original slot may be outside it).
            foreach (var ex in exceptions.Where(e => e.RoutineId == r.Id && e.Type == ClassChangeType.Reschedule
                         && e.NewDate >= first && e.NewDate <= last))
            {
                result.Add(new ClassOccurrence(r.Id, ex.NewDate!.Value, ex.NewStartTime!.Value, ex.NewEndTime!.Value,
                    ClassStatus.Moved, r.EventType, slot.Course, slot.Section, slot.Teacher,
                    ex.NewRoomId ?? roomId,
                    ex.NewRoomId is { } id && rooms.TryGetValue(id, out var label) ? label : room,
                    ex.Reason, new Slot(ex.ExceptionDate, r.StartTime, r.EndTime), null));
            }
        }

        return [.. result.OrderBy(c => c.Date).ThenBy(c => c.Start).ThenBy(c => c.Course?.Code)];
    }

    private static string? RoomLabel(Routine routine, Dictionary<Guid, string> rooms)
    {
        if (routine.RoomId is { } id && rooms.TryGetValue(id, out var label))
        {
            return label;
        }

        // Legacy free-text room until routines get a real room.
        if (routine.Metadata is null)
        {
            return null;
        }

        try
        {
            using var json = JsonDocument.Parse(routine.Metadata);
            return json.RootElement.ValueKind == JsonValueKind.Object
                && json.RootElement.TryGetProperty("room_number", out var value)
                && value.ValueKind == JsonValueKind.String && value.GetString() is { Length: > 0 } text
                ? text
                : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static DateOnly Max(DateOnly a, DateOnly b) => a > b ? a : b;

    private static DateOnly Min(DateOnly a, DateOnly b) => a < b ? a : b;
}
