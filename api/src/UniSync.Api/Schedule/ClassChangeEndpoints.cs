using System.Globalization;
using System.Security.Claims;
using UniSync.Api.Auth;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Schedule;

public sealed record CancelBody(string? Reason);
public sealed record MoveBody(string? Date, string? Start, string? End, Guid? RoomId, string? Reason);
public sealed record RoomBody(Guid? RoomId, string? Reason);

public sealed record ClassChangeResult(
    Guid RoutineId, DateOnly Date, string Change, string? Reason, Slot? MovedTo, string? Room, Guid NotificationId);

/// <summary>
/// Day-of-class actions (UX review decision 3): cancel, move or re-room one
/// occurrence of a class, or undo that. Each change notifies the section.
/// </summary>
public static class ClassChangeEndpoints
{
    public const string Policy = "class-changes";
    private const int MaxReasonLength = 300;

    public static RouteGroupBuilder MapClassChangeEndpoints(this RouteGroupBuilder api)
    {
        var classes = api.MapGroup("/classes/{routineId:guid}/{date}").WithTags("Class changes")
            .RequireAuthorization().RequireRateLimiting(Policy);
        classes.MapPost("/cancel", CancelAsync);
        classes.MapPost("/move", MoveAsync);
        classes.MapPost("/room", ChangeRoomAsync);
        classes.MapDelete("/", RestoreAsync);
        return api;
    }

    private static async Task<IResult> CancelAsync(
        Guid routineId, string date, CancelBody body, ClaimsPrincipal user, HttpContext http,
        ClassChangeService service, CampusClock clock, CancellationToken ct)
    {
        var (ctx, day, failure) = await AuthorizeAsync(routineId, date, user, http, service, clock, ct);
        if (failure is not null)
        {
            return failure;
        }

        if (Reason(body.Reason) is not { } reason)
        {
            return ReasonRequired(http);
        }

        var by = UserId(user);
        var notice = ClassChangeService.Notice(ctx!, by, "cancelled", day,
            $"{ctx!.CourseCode} cancelled",
            $"{ClassChangeService.Describe(day, ctx.Routine.StartTime)} class is cancelled: {reason}");
        var id = await service.SaveAsync(new ClassChange
        {
            RoutineId = routineId, ExceptionDate = day, Type = ClassChangeType.Cancellation, Reason = reason, CreatedBy = by,
        }, notice, ct);

        return ApiResponse.Ok(http, "Class cancelled. The section has been notified.",
            new ClassChangeResult(routineId, day, ClassChangeType.Cancellation, reason, null, null, id));
    }

    private static async Task<IResult> MoveAsync(
        Guid routineId, string date, MoveBody body, ClaimsPrincipal user, HttpContext http,
        ClassChangeService service, CampusClock clock, CancellationToken ct)
    {
        var (ctx, day, failure) = await AuthorizeAsync(routineId, date, user, http, service, clock, ct);
        if (failure is not null)
        {
            return failure;
        }

        var errors = new Dictionary<string, string>();
        var newDate = ParseDate(body.Date);
        var start = ParseTime(body.Start);
        var end = ParseTime(body.End);
        var reason = Reason(body.Reason);
        if (newDate is null)
        {
            errors["date"] = "Choose the new date.";
        }
        else if (newDate < clock.Today)
        {
            errors["date"] = "The new date can't be in the past.";
        }

        if (start is null)
        {
            errors["start"] = "Choose a start time like 14:00.";
        }

        if (end is null)
        {
            errors["end"] = "Choose an end time like 15:30.";
        }
        else if (start is not null && end <= start)
        {
            errors["end"] = "The class must end after it starts.";
        }

        if (reason is null)
        {
            errors["reason"] = "Tell students why.";
        }

        if (errors.Count == 0 && newDate == day && start == ctx!.Routine.StartTime && end == ctx.Routine.EndTime)
        {
            errors["date"] = "That's the class's usual slot. Choose a different time.";
        }

        if (errors.Count > 0)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Some fields need fixing.", errors);
        }

        string? roomLabel = ctx!.RoomLabel;
        if (body.RoomId is { } roomId)
        {
            roomLabel = await service.RoomLabelAsync(roomId, ct);
            if (roomLabel is null)
            {
                return UnknownRoom(http);
            }
        }

        var targetRoom = body.RoomId ?? ctx.Routine.RoomId;
        if (await service.FindClashAsync(ctx, newDate!.Value, start!.Value, end!.Value, targetRoom, ClashChecks.All, ct) is { } clash)
        {
            return ApiResponse.Fail(http, 409, clash.Code, clash.Message,
                new { course = clash.With.Course?.Code, start = clash.With.Start, end = clash.With.End });
        }

        var by = UserId(user);
        var movedTo = new Slot(newDate.Value, start.Value, end.Value);
        var notice = ClassChangeService.Notice(ctx, by, "moved", day,
            $"{ctx.CourseCode} moved",
            $"{ClassChangeService.Describe(day, ctx.Routine.StartTime)} class moves to " +
            $"{ClassChangeService.Describe(newDate.Value, start.Value)}–{end.Value.ToString("HH:mm", CultureInfo.InvariantCulture)}" +
            (roomLabel is null ? "" : $" in {roomLabel}") + $": {reason}");
        var id = await service.SaveAsync(new ClassChange
        {
            RoutineId = routineId, ExceptionDate = day, Type = ClassChangeType.Reschedule, Reason = reason!, CreatedBy = by,
            NewDate = newDate, NewStartTime = start, NewEndTime = end, NewRoomId = body.RoomId,
        }, notice, ct);

        return ApiResponse.Ok(http, "Class moved. The section has been notified.",
            new ClassChangeResult(routineId, day, ClassChangeType.Reschedule, reason, movedTo, roomLabel, id));
    }

    private static async Task<IResult> ChangeRoomAsync(
        Guid routineId, string date, RoomBody body, ClaimsPrincipal user, HttpContext http,
        ClassChangeService service, CampusClock clock, CancellationToken ct)
    {
        var (ctx, day, failure) = await AuthorizeAsync(routineId, date, user, http, service, clock, ct);
        if (failure is not null)
        {
            return failure;
        }

        var reason = Reason(body.Reason);
        if (body.RoomId is null || reason is null)
        {
            var errors = new Dictionary<string, string>();
            if (body.RoomId is null)
            {
                errors["roomId"] = "Choose the new room.";
            }

            if (reason is null)
            {
                errors["reason"] = "Tell students why.";
            }

            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Some fields need fixing.", errors);
        }

        if (body.RoomId == ctx!.Routine.RoomId)
        {
            return ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "That's already the class's room.",
                new Dictionary<string, string> { ["roomId"] = "Choose a different room." });
        }

        var roomLabel = await service.RoomLabelAsync(body.RoomId.Value, ct);
        if (roomLabel is null)
        {
            return UnknownRoom(http);
        }

        if (await service.FindClashAsync(ctx, day, ctx.Routine.StartTime, ctx.Routine.EndTime, body.RoomId, ClashChecks.Room, ct) is { } clash)
        {
            return ApiResponse.Fail(http, 409, clash.Code, clash.Message,
                new { course = clash.With.Course?.Code, start = clash.With.Start, end = clash.With.End });
        }

        var by = UserId(user);
        var notice = ClassChangeService.Notice(ctx, by, "room_changed", day,
            $"{ctx.CourseCode} room changed",
            $"{ClassChangeService.Describe(day, ctx.Routine.StartTime)} class is now in {roomLabel}: {reason}");
        var id = await service.SaveAsync(new ClassChange
        {
            RoutineId = routineId, ExceptionDate = day, Type = ClassChangeType.RoomChange, Reason = reason, CreatedBy = by,
            NewRoomId = body.RoomId,
        }, notice, ct);

        return ApiResponse.Ok(http, "Room changed. The section has been notified.",
            new ClassChangeResult(routineId, day, ClassChangeType.RoomChange, reason, null, roomLabel, id));
    }

    private static async Task<IResult> RestoreAsync(
        Guid routineId, string date, ClaimsPrincipal user, HttpContext http,
        ClassChangeService service, CampusClock clock, CancellationToken ct)
    {
        var (ctx, day, failure) = await AuthorizeAsync(routineId, date, user, http, service, clock, ct);
        if (failure is not null)
        {
            return failure;
        }

        var by = UserId(user);
        var notice = ClassChangeService.Notice(ctx!, by, "restored", day,
            $"{ctx!.CourseCode} back on",
            $"{ClassChangeService.Describe(day, ctx.Routine.StartTime)} class is happening as normal.");
        if (!await service.RestoreAsync(routineId, day, notice, ct))
        {
            return ApiResponse.Fail(http, 404, ErrorCodes.NotFound, "That class has no change to undo.");
        }

        return ApiResponse.Ok(http, "Change undone. The section has been notified.",
            new ClassChangeResult(routineId, day, "restored", null, null, ctx.RoomLabel, notice.Id));
    }

    // ---------------------------------------------------------------- shared checks

    /// <summary>Class exists, happens on that date, isn't over, and the user may change it.</summary>
    private static async Task<(ClassContext? Ctx, DateOnly Day, IResult? Failure)> AuthorizeAsync(
        Guid routineId, string date, ClaimsPrincipal user, HttpContext http,
        ClassChangeService service, CampusClock clock, CancellationToken ct)
    {
        if (ParseDate(date) is not { } day)
        {
            return (null, default, ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "The date must look like 2026-11-09."));
        }

        var ctx = await service.LoadAsync(routineId, ct);
        if (ctx is null)
        {
            return (null, day, ApiResponse.Fail(http, 404, ErrorCodes.NotFound, "Class not found."));
        }

        if (!await service.CanChangeAsync(UserId(user), user.FindFirstValue(TokenService.RoleClaim) ?? "", ctx, ct))
        {
            return (null, day, ApiResponse.Fail(http, 403, ErrorCodes.Forbidden,
                "Only this class's teacher, its section's CR or the department admin can change it."));
        }

        if (!ClassChangeService.OccursOn(ctx.Routine, day))
        {
            return (null, day, ApiResponse.Fail(http, 400, ErrorCodes.NotAClassDay, "This class doesn't take place on that date."));
        }

        if (day < clock.Today)
        {
            return (null, day, ApiResponse.Fail(http, 400, ErrorCodes.ClassInPast, "That class has already taken place."));
        }

        return (ctx, day, null);
    }

    private static string? Reason(string? raw) =>
        raw?.Trim() is { Length: > 0 and <= MaxReasonLength } reason ? reason : null;

    private static IResult ReasonRequired(HttpContext http) =>
        ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "Tell students why.",
            new Dictionary<string, string> { ["reason"] = $"Give a reason (up to {MaxReasonLength} characters)." });

    private static IResult UnknownRoom(HttpContext http) =>
        ApiResponse.Fail(http, 400, ErrorCodes.ValidationFailed, "That room doesn't exist.",
            new Dictionary<string, string> { ["roomId"] = "Choose a room from the list." });

    private static DateOnly? ParseDate(string? value) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d) ? d : null;

    private static TimeOnly? ParseTime(string? value) =>
        TimeOnly.TryParseExact(value, ["HH:mm", "HH:mm:ss"], CultureInfo.InvariantCulture, DateTimeStyles.None, out var t) ? t : null;

    private static Guid UserId(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue(TokenService.UserIdClaim)!);
}
