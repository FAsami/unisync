using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Schedule;

/// <summary>One weekly class on one date, with everything a change needs to know.</summary>
public sealed record ClassContext(
    Routine Routine, CourseOffering Offering, Guid DepartmentId, string CourseCode, string SectionName, string? RoomLabel);

public sealed record Clash(string Code, string Message, ClassOccurrence With);

/// <summary>Which collisions to look for. A room change keeps the time, so only the room matters.</summary>
[Flags]
public enum ClashChecks
{
    None = 0,
    Section = 1,
    Teacher = 2,
    Room = 4,
    All = Section | Teacher | Room,
}

/// <summary>
/// Validation, permission and clash rules for changing one class occurrence,
/// and the write itself (change + section notification in one transaction).
/// </summary>
public sealed class ClassChangeService(UniSyncDbContext db, ScheduleService schedule)
{
    public async Task<ClassContext?> LoadAsync(Guid routineId, CancellationToken ct)
    {
        var row = await (
            from r in db.Routines
            join o in db.CourseOfferings on r.CourseOfferingId equals o.Id
            join b in db.Batches on o.BatchId equals b.Id
            join s in db.Sections on o.SectionId equals s.Id
            join c in db.Courses on o.CourseId equals c.Id
            where r.Id == routineId && r.IsActive && o.IsActive
            select new { r, o, b.DepartmentId, c.Code, SectionName = s.Name }).AsNoTracking().FirstOrDefaultAsync(ct);
        if (row is null)
        {
            return null;
        }

        string? room = null;
        if (row.r.RoomId is { } roomId)
        {
            room = await RoomLabelAsync(roomId, ct);
        }

        return new ClassContext(row.r, row.o, row.DepartmentId, row.Code, row.SectionName, room);
    }

    public static bool OccursOn(Routine routine, DateOnly date) =>
        (int)date.DayOfWeek == routine.DayOfWeek && date >= routine.EffectiveFrom && date <= routine.EffectiveTo;

    /// <summary>The class's teacher, an active CR of its section, or the admin of its department.</summary>
    public async Task<bool> CanChangeAsync(Guid userId, string role, ClassContext ctx, CancellationToken ct)
    {
        if (ctx.Offering.TeacherId == userId)
        {
            return true;
        }

        if (role is "student" or "class_representative"
            && await db.ClassRepresentatives.AnyAsync(c => c.UserId == userId && c.SectionId == ctx.Offering.SectionId && c.IsActive, ct))
        {
            return true;
        }

        return role == "admin"
            && await db.Accounts.AnyAsync(a => a.Id == userId && a.ManagedDepartmentId == ctx.DepartmentId, ct);
    }

    /// <summary>
    /// Would the class at [start, end) on <paramref name="date"/> collide with another
    /// class of the same section, the same teacher, or in the same room?
    /// </summary>
    public async Task<Clash?> FindClashAsync(
        ClassContext ctx, DateOnly date, TimeOnly start, TimeOnly end, Guid? roomId, ClashChecks checks, CancellationToken ct)
    {
        bool Overlaps(ClassOccurrence c) =>
            c.RoutineId != ctx.Routine.Id && c.Happens && c.Date == date && c.Start < end && start < c.End;

        if (checks.HasFlag(ClashChecks.Section))
        {
            var section = await schedule.ResolveAsync(
                db.CourseOfferings.Where(o => o.IsActive && o.SectionId == ctx.Offering.SectionId), date, date, ct);
            if (section.FirstOrDefault(Overlaps) is { } s)
            {
                return new(ErrorCodes.SectionBusy, $"Section {ctx.SectionName} already has {s.Course?.Code} at that time.", s);
            }
        }

        if (checks.HasFlag(ClashChecks.Teacher))
        {
            var teacher = await schedule.ResolveAsync(
                db.CourseOfferings.Where(o => o.IsActive && o.TeacherId == ctx.Offering.TeacherId), date, date, ct);
            if (teacher.FirstOrDefault(Overlaps) is { } t)
            {
                return new(ErrorCodes.TeacherBusy, $"The teacher already has {t.Course?.Code} at that time.", t);
            }
        }

        if (checks.HasFlag(ClashChecks.Room) && roomId is { } room)
        {
            // Offerings with a class normally in this room, or moved into it on this date.
            var offeringIds = db.Routines.Where(r => r.RoomId == room).Select(r => r.CourseOfferingId)
                .Union(
                    from c in db.ClassChanges
                    join r in db.Routines on c.RoutineId equals r.Id
                    where c.NewRoomId == room && (c.ExceptionDate == date || c.NewDate == date)
                    select r.CourseOfferingId);
            var inRoom = await schedule.ResolveAsync(
                db.CourseOfferings.Where(o => o.IsActive && offeringIds.Contains(o.Id)), date, date, ct);
            if (inRoom.FirstOrDefault(c => c.RoomId == room && Overlaps(c)) is { } r2)
            {
                return new(ErrorCodes.RoomTaken, $"That room is booked for {r2.Course?.Code} at that time.", r2);
            }
        }

        return null;
    }

    /// <summary>Saves the occurrence's change (replacing any earlier one) and notifies the section, atomically.</summary>
    public async Task<Guid> SaveAsync(ClassChange change, NotificationLog notice, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO event.routine_exception (routine_id, exception_date, type, reason, created_by, new_date, new_start_time, new_end_time, new_room_id)
            VALUES ({change.RoutineId}, {change.ExceptionDate}, {change.Type}, {change.Reason}, {change.CreatedBy},
                    {change.NewDate}, {change.NewStartTime}, {change.NewEndTime}, {change.NewRoomId})
            ON CONFLICT (routine_id, exception_date) DO UPDATE SET
                type = EXCLUDED.type, reason = EXCLUDED.reason, created_by = EXCLUDED.created_by, created_at = now(),
                new_date = EXCLUDED.new_date, new_start_time = EXCLUDED.new_start_time,
                new_end_time = EXCLUDED.new_end_time, new_room_id = EXCLUDED.new_room_id
            """, ct);
        db.Notifications.Add(notice);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return notice.Id;
    }

    /// <summary>Removes the occurrence's change, if any, and tells the section the class is back to normal.</summary>
    public async Task<bool> RestoreAsync(Guid routineId, DateOnly date, NotificationLog notice, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var removed = await db.ClassChanges.Where(c => c.RoutineId == routineId && c.ExceptionDate == date).ExecuteDeleteAsync(ct);
        if (removed == 0)
        {
            return false;
        }

        db.Notifications.Add(notice);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return true;
    }

    public Task<string?> RoomLabelAsync(Guid roomId, CancellationToken ct) =>
        (from r in db.Rooms
         join b in db.Buildings on r.BuildingId equals b.Id
         where r.Id == roomId
         select r.RoomNumber + ", " + b.Name).FirstOrDefaultAsync(ct);

    public static NotificationLog Notice(ClassContext ctx, Guid by, string change, DateOnly date, string title, string body)
    {
        // The id is chosen here so the push payload can carry it: tapping the
        // push opens this notification in the inbox.
        var id = Guid.NewGuid();
        return new NotificationLog
        {
            Id = id,
            Title = title,
            Body = body,
            TargetType = "section",
            TargetId = ctx.Offering.SectionId,
            CreatedBy = by,
            Data = JsonSerializer.Serialize(new Dictionary<string, string>
            {
                ["type"] = "class_change",
                ["change"] = change,
                ["routineId"] = ctx.Routine.Id.ToString(),
                ["date"] = date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                ["notificationId"] = id.ToString(),
            }),
        };
    }

    /// <summary>"Mon 9 Nov, 09:00".</summary>
    public static string Describe(DateOnly date, TimeOnly time) =>
        $"{date.ToString("ddd d MMM", CultureInfo.InvariantCulture)}, {time.ToString("HH:mm", CultureInfo.InvariantCulture)}";
}
