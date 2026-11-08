using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record RoomRef(Guid Id, string Label);

public sealed record RoutineView(
    Guid Id, Guid OfferingId, CourseRef Course, Ref Section, Ref Teacher,
    int DayOfWeek, TimeOnly StartTime, TimeOnly EndTime, string EventType, RoomRef? Room,
    DateOnly EffectiveFrom, DateOnly EffectiveTo, bool IsActive);

/// <summary>A whole weekly slot (PUT replaces it). Times are campus-local "HH:mm"; days 0 = Sunday … 6 = Saturday.</summary>
public sealed record RoutineBody(
    Guid? OfferingId, int? DayOfWeek, string? StartTime, string? EndTime, string? EventType, Guid? RoomId,
    string? EffectiveFrom, string? EffectiveTo, bool? IsActive);

/// <summary>
/// The weekly routine: when and where each offering meets. Saving a slot is
/// refused if it overlaps another active slot of the same section, the same
/// teacher (in any department) or the same room, on the same weekday within
/// overlapping terms. One-off changes to a single date are class changes
/// (<c>/classes/{routineId}/{date}</c>), not edits here.
/// </summary>
public static class RoutineEndpoints
{
    public static readonly string[] EventTypes = ["lecture", "lab", "tutorial", "exam", "other"];

    public static RouteGroupBuilder MapRoutineSetupEndpoints(this RouteGroupBuilder api)
    {
        var routines = api.MapDepartmentAdminGroup("/routines", "Setup: offerings and routine");
        routines.MapGet("/", ListAsync).Returns<List<RoutineView>>();
        routines.MapPost("/", CreateAsync).Returns<RoutineView>(StatusCodes.Status201Created);
        routines.MapPut("/{id:guid}", ReplaceAsync).Returns<RoutineView>();
        routines.MapDelete("/{id:guid}", DeleteAsync).Returns<DeletedResult>();
        return api;
    }

    private static async Task<IResult> ListAsync(
        HttpContext http, UniSyncDbContext db, Guid? batchId, Guid? sectionId, Guid? teacherId, Guid? offeringId, Guid? roomId,
        int? day, bool? active, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var query =
            from r in db.Routines.AsNoTracking()
            join o in OfferingEndpoints.InDepartment(db, departmentId) on r.CourseOfferingId equals (Guid?)o.Id
            where (batchId == null || o.BatchId == batchId)
                && (sectionId == null || o.SectionId == sectionId)
                && (teacherId == null || o.TeacherId == teacherId)
                && (offeringId == null || o.Id == offeringId)
                && (roomId == null || r.RoomId == roomId)
                && (day == null || r.DayOfWeek == day)
                && (active == null || r.IsActive == active)
            select r;
        var rows = await Project(db, query).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", rows.OrderBy(r => r.DayOfWeek).ThenBy(r => r.StartTime).ThenBy(r => r.Section.Name).ToList());
    }

    private static async Task<IResult> CreateAsync(RoutineBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var routine = new Routine();
        return await SaveAsync(routine, body, http, db, creating: true, ct);
    }

    private static async Task<IResult> ReplaceAsync(Guid id, RoutineBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var routine = await (
            from r in db.Routines
            join o in OfferingEndpoints.InDepartment(db, departmentId, tracking: true) on r.CourseOfferingId equals (Guid?)o.Id
            where r.Id == id
            select r).FirstOrDefaultAsync(ct);
        return routine is null ? NotFound(http) : await SaveAsync(routine, body, http, db, creating: false, ct);
    }

    private static async Task<IResult> DeleteAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var exists = await (
            from r in db.Routines
            join o in OfferingEndpoints.InDepartment(db, departmentId) on r.CourseOfferingId equals (Guid?)o.Id
            where r.Id == id
            select r.Id).AnyAsync(ct);
        if (!exists)
        {
            return NotFound(http);
        }

        // Its one-off changes describe occurrences of this slot, so they go with it.
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.ClassChanges.Where(c => c.RoutineId == id).ExecuteDeleteAsync(ct);
        await db.Routines.Where(r => r.Id == id).ExecuteDeleteAsync(ct);
        await transaction.CommitAsync(ct);
        return ApiResponse.Ok(http, "Class removed from the routine", new DeletedResult(id));
    }

    private static async Task<IResult> SaveAsync(Routine routine, RoutineBody body, HttpContext http, UniSyncDbContext db, bool creating, CancellationToken ct)
    {
        var departmentId = SetupScope.DepartmentId(http);
        var errors = new Dictionary<string, string>();
        if (body.OfferingId is null)
        {
            errors["offeringId"] = "Choose the course and section (offering).";
        }

        if (body.DayOfWeek is null or < 0 or > 6)
        {
            errors["dayOfWeek"] = "Choose a day (0 = Sunday … 6 = Saturday).";
        }

        if (!SetupScope.TryTime(body.StartTime, out var start))
        {
            errors["startTime"] = "Use a time like 09:00.";
        }

        if (!SetupScope.TryTime(body.EndTime, out var end))
        {
            errors["endTime"] = "Use a time like 10:15.";
        }
        else if (!errors.ContainsKey("startTime") && end <= start)
        {
            errors["endTime"] = "The class must end after it starts.";
        }

        var eventType = string.IsNullOrWhiteSpace(body.EventType) ? "lecture" : body.EventType.Trim().ToLowerInvariant();
        if (!EventTypes.Contains(eventType))
        {
            errors["eventType"] = "Choose lecture, lab, tutorial, exam or other.";
        }

        if (!SetupScope.TryDate(body.EffectiveFrom, out var from))
        {
            errors["effectiveFrom"] = "Use a date like 2026-09-01.";
        }

        if (!SetupScope.TryDate(body.EffectiveTo, out var to))
        {
            errors["effectiveTo"] = "Use a date like 2027-01-31.";
        }
        else if (!errors.ContainsKey("effectiveFrom") && to < from)
        {
            errors["effectiveTo"] = "The term must end after it starts.";
        }

        if (errors.Count > 0)
        {
            return SetupScope.Invalid(http, errors);
        }

        var offering = await (
            from o in OfferingEndpoints.InDepartment(db, departmentId)
            join c in db.Courses on o.CourseId equals c.Id
            join s in db.Sections on o.SectionId equals s.Id
            where o.Id == body.OfferingId
            select new { Offering = o, c.Code, SectionName = s.Name }).FirstOrDefaultAsync(ct);
        if (offering is null)
        {
            return SetupScope.NotFound(http, "Offering");
        }

        if (body.RoomId is { } roomId && !await db.Rooms.AnyAsync(r => r.Id == roomId, ct))
        {
            return SetupScope.NotFound(http, "Room");
        }

        routine.CourseOfferingId = offering.Offering.Id;
        routine.Name = offering.Code;
        routine.DayOfWeek = body.DayOfWeek!.Value;
        routine.StartTime = start;
        routine.EndTime = end;
        routine.EventType = eventType;
        routine.RoomId = body.RoomId;
        routine.EffectiveFrom = from;
        routine.EffectiveTo = to;
        routine.IsActive = body.IsActive ?? true;

        if (routine.IsActive && offering.Offering.IsActive
            && await FindClashAsync(db, routine, offering.Offering, ct) is { } clash)
        {
            return ApiResponse.Fail(http, 409, clash.Code, clash.Message);
        }

        if (creating)
        {
            db.Routines.Add(routine);
        }

        await db.SaveChangesAsync(ct);
        var view = await Project(db, db.Routines.Where(r => r.Id == routine.Id)).FirstAsync(ct);
        return creating
            ? ApiResponse.Ok(http, "Class added to the routine", view, StatusCodes.Status201Created)
            : ApiResponse.Ok(http, "Saved", view);
    }

    private sealed record SlotClash(string Code, string Message);

    /// <summary>
    /// Another active weekly slot on the same day, overlapping in time and term,
    /// for the same section, teacher or room. Same rules as one-off moves
    /// (<c>ClassChangeService.FindClashAsync</c>), applied to the weekly pattern.
    /// </summary>
    private static async Task<SlotClash?> FindClashAsync(UniSyncDbContext db, Routine slot, CourseOffering offering, CancellationToken ct)
    {
        var others = await (
            from r in db.Routines.AsNoTracking()
            join o in db.CourseOfferings on r.CourseOfferingId equals (Guid?)o.Id
            join c in db.Courses on o.CourseId equals c.Id
            join s in db.Sections on o.SectionId equals s.Id
            where r.Id != slot.Id && r.IsActive && o.IsActive
                && r.DayOfWeek == slot.DayOfWeek
                && r.StartTime < slot.EndTime && slot.StartTime < r.EndTime
                && r.EffectiveFrom <= slot.EffectiveTo && slot.EffectiveFrom <= r.EffectiveTo
                && (o.SectionId == offering.SectionId || o.TeacherId == offering.TeacherId || (slot.RoomId != null && r.RoomId == slot.RoomId))
            select new { o.SectionId, o.TeacherId, r.RoomId, c.Code, SectionName = s.Name, r.StartTime, r.EndTime }).ToListAsync(ct);

        static string When(TimeOnly a, TimeOnly b) => $"{a:HH\\:mm}–{b:HH\\:mm}";

        if (others.FirstOrDefault(o => o.SectionId == offering.SectionId) is { } section)
        {
            return new(ErrorCodes.SectionBusy, $"Section {section.SectionName} already has {section.Code} at {When(section.StartTime, section.EndTime)}.");
        }

        if (others.FirstOrDefault(o => o.TeacherId == offering.TeacherId) is { } teacher)
        {
            return new(ErrorCodes.TeacherBusy, $"The teacher already has {teacher.Code} at {When(teacher.StartTime, teacher.EndTime)}.");
        }

        if (others.FirstOrDefault(o => slot.RoomId != null && o.RoomId == slot.RoomId) is { } room)
        {
            return new(ErrorCodes.RoomTaken, $"That room is booked for {room.Code} at {When(room.StartTime, room.EndTime)}.");
        }

        return null;
    }

    private static IQueryable<RoutineView> Project(UniSyncDbContext db, IQueryable<Routine> routines) =>
        from r in routines.AsNoTracking()
        join o in db.CourseOfferings on r.CourseOfferingId equals (Guid?)o.Id
        join c in db.Courses on o.CourseId equals c.Id
        join s in db.Sections on o.SectionId equals s.Id
        join room in db.Rooms on r.RoomId equals (Guid?)room.Id into rooms
        from room in rooms.DefaultIfEmpty()
        join b in db.Buildings on room.BuildingId equals b.Id into buildings
        from b in buildings.DefaultIfEmpty()
        select new RoutineView(
            r.Id, o.Id, new CourseRef(c.Id, c.Code, c.Name), new Ref(s.Id, s.Name),
            new Ref(o.TeacherId, db.TeacherProfiles.Where(t => t.UserId == o.TeacherId)
                .Select(t => ((t.FirstName ?? "") + " " + (t.LastName ?? "")).Trim()).FirstOrDefault() ?? ""),
            r.DayOfWeek, r.StartTime, r.EndTime, r.EventType,
            room == null ? null : new RoomRef(room.Id, room.RoomNumber + ", " + b.Name),
            r.EffectiveFrom, r.EffectiveTo, r.IsActive);

    private static IResult NotFound(HttpContext http) => SetupScope.NotFound(http, "Routine slot");
}
