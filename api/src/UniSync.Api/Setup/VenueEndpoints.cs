using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using UniSync.Api.Common;
using UniSync.Api.Data;

namespace UniSync.Api.Setup;

public sealed record RoomView(
    Guid Id, Guid BuildingId, string BuildingName, string RoomNumber, string RoomName, string Floor, int? Capacity, string Label);

public sealed record BuildingView(Guid Id, string Name, string Code, string Address, IReadOnlyList<RoomView> Rooms);

public sealed record BuildingBody(string? Name, string? Code, string? Address);

public sealed record RoomDetailsBody(Guid? BuildingId, string? RoomNumber, string? RoomName, string? Floor, int? Capacity);

/// <summary>
/// Buildings and rooms are shared by the whole university: anyone signed in can
/// list them (a teacher or CR picks a room when moving a class), and any
/// department admin can add or correct them.
/// </summary>
public static partial class VenueEndpoints
{
    public static RouteGroupBuilder MapVenueEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/buildings", ListBuildingsAsync).WithTags("Rooms").RequireAuthorization().Returns<List<BuildingView>>();
        api.MapGet("/rooms", ListRoomsAsync).WithTags("Rooms").RequireAuthorization().Returns<List<RoomView>>();

        var buildings = api.MapDepartmentAdminGroup("/buildings", "Rooms");
        buildings.MapPost("/", CreateBuildingAsync).Returns<BuildingView>(StatusCodes.Status201Created);
        buildings.MapPatch("/{id:guid}", UpdateBuildingAsync).Returns<BuildingView>();
        buildings.MapDelete("/{id:guid}", DeleteBuildingAsync).Returns<DeletedResult>();

        var rooms = api.MapDepartmentAdminGroup("/rooms", "Rooms");
        rooms.MapPost("/", CreateRoomAsync).Returns<RoomView>(StatusCodes.Status201Created);
        rooms.MapPatch("/{id:guid}", UpdateRoomAsync).Returns<RoomView>();
        rooms.MapDelete("/{id:guid}", DeleteRoomAsync).Returns<DeletedResult>();
        return api;
    }

    // ---------------------------------------------------------------- reads

    private static async Task<IResult> ListBuildingsAsync(HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var buildings = await db.Buildings.AsNoTracking().OrderBy(b => b.Name).ToListAsync(ct);
        var rooms = await RoomsQuery(db).ToListAsync(ct);
        return ApiResponse.Ok(http, "OK", buildings.Select(b => View(b, rooms)).ToList());
    }

    private static async Task<IResult> ListRoomsAsync(HttpContext http, UniSyncDbContext db, Guid? buildingId, CancellationToken ct)
    {
        return ApiResponse.Ok(http, "OK", await RoomsQuery(db, buildingId: buildingId).ToListAsync(ct));
    }

    // Filters run on the entities: EF can't filter on a record built by its constructor.
    private static IQueryable<RoomView> RoomsQuery(UniSyncDbContext db, Guid? buildingId = null, Guid? roomId = null) =>
        from r in db.Rooms.AsNoTracking()
        join b in db.Buildings on r.BuildingId equals b.Id
        where (buildingId == null || r.BuildingId == buildingId) && (roomId == null || r.Id == roomId)
        orderby b.Name, r.RoomNumber
        select new RoomView(r.Id, b.Id, b.Name, r.RoomNumber, r.RoomName, r.Floor, r.Capacity, r.RoomNumber + ", " + b.Name);

    // ---------------------------------------------------------------- buildings

    private static async Task<IResult> CreateBuildingAsync(BuildingBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var building = new Building();
        if (Apply(building, body, creating: true) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        db.Buildings.Add(building);
        return await SaveBuildingAsync(http, db, building, "Building added", StatusCodes.Status201Created, ct);
    }

    private static async Task<IResult> UpdateBuildingAsync(Guid id, BuildingBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var building = await db.Buildings.FirstOrDefaultAsync(b => b.Id == id, ct);
        if (building is null)
        {
            return SetupScope.NotFound(http, "Building");
        }

        if (Apply(building, body, creating: false) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        return await SaveBuildingAsync(http, db, building, "Saved", StatusCodes.Status200OK, ct);
    }

    private static async Task<IResult> DeleteBuildingAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        if (!await db.Buildings.AnyAsync(b => b.Id == id, ct))
        {
            return SetupScope.NotFound(http, "Building");
        }

        if (await db.Rooms.AnyAsync(r => r.BuildingId == id, ct))
        {
            return SetupScope.InUse(http, "Remove this building's rooms first.");
        }

        await db.Buildings.Where(b => b.Id == id).ExecuteDeleteAsync(ct);
        return ApiResponse.Ok(http, "Building deleted", new DeletedResult(id));
    }

    private static async Task<IResult> SaveBuildingAsync(
        HttpContext http, UniSyncDbContext db, Building building, string message, int status, CancellationToken ct)
    {
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "building_code_key"))
        {
            return SetupScope.Exists(http, $"Another building already uses the code {building.Code}.");
        }

        var rooms = await RoomsQuery(db, buildingId: building.Id).ToListAsync(ct);
        return ApiResponse.Ok(http, message, View(building, rooms), status);
    }

    private static Dictionary<string, string> Apply(Building building, BuildingBody body, bool creating)
    {
        var errors = new Dictionary<string, string>();
        var name = SetupScope.Clean(body.Name);
        var code = SetupScope.Clean(body.Code)?.ToUpperInvariant();
        var address = SetupScope.Clean(body.Address);
        if (creating)
        {
            SetupScope.Required(errors, "name", name, 100, "Enter the building's name.");
            SetupScope.Required(errors, "address", address, 300, "Enter where the building is.");
        }
        else
        {
            SetupScope.RequiredIfSent(errors, "name", name, 100, "Enter the building's name.");
            SetupScope.RequiredIfSent(errors, "address", address, 300, "Enter where the building is.");
        }

        if ((creating || code is not null) && (code is null || !CodePattern().IsMatch(code)))
        {
            errors["code"] = "Use 1–16 letters, numbers or dashes, like AB1.";
        }

        if (errors.Count == 0)
        {
            building.Name = name ?? building.Name;
            building.Code = code ?? building.Code;
            building.Address = address ?? building.Address;
        }

        return errors;
    }

    private static BuildingView View(Building b, List<RoomView> rooms) =>
        new(b.Id, b.Name, b.Code, b.Address, rooms.Where(r => r.BuildingId == b.Id).ToList());

    // ---------------------------------------------------------------- rooms

    private static async Task<IResult> CreateRoomAsync(RoomDetailsBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var room = new Room();
        if (Apply(room, body, creating: true) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        if (!await db.Buildings.AnyAsync(b => b.Id == room.BuildingId, ct))
        {
            return SetupScope.NotFound(http, "Building");
        }

        db.Rooms.Add(room);
        return await SaveRoomAsync(http, db, room, "Room added", StatusCodes.Status201Created, ct);
    }

    private static async Task<IResult> UpdateRoomAsync(Guid id, RoomDetailsBody body, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        var room = await db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (room is null)
        {
            return SetupScope.NotFound(http, "Room");
        }

        if (Apply(room, body, creating: false) is { Count: > 0 } errors)
        {
            return SetupScope.Invalid(http, errors);
        }

        if (!await db.Buildings.AnyAsync(b => b.Id == room.BuildingId, ct))
        {
            return SetupScope.NotFound(http, "Building");
        }

        return await SaveRoomAsync(http, db, room, "Saved", StatusCodes.Status200OK, ct);
    }

    private static async Task<IResult> DeleteRoomAsync(Guid id, HttpContext http, UniSyncDbContext db, CancellationToken ct)
    {
        if (!await db.Rooms.AnyAsync(r => r.Id == id, ct))
        {
            return SetupScope.NotFound(http, "Room");
        }

        if (await db.Routines.AnyAsync(r => r.RoomId == id, ct) || await db.ClassChanges.AnyAsync(c => c.NewRoomId == id, ct))
        {
            return SetupScope.InUse(http, "Classes are held in this room. Move them to another room first.");
        }

        await db.Rooms.Where(r => r.Id == id).ExecuteDeleteAsync(ct);
        return ApiResponse.Ok(http, "Room deleted", new DeletedResult(id));
    }

    private static async Task<IResult> SaveRoomAsync(HttpContext http, UniSyncDbContext db, Room room, string message, int status, CancellationToken ct)
    {
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (SetupScope.IsUniqueViolation(ex, "room_building_id_room_number_key"))
        {
            return SetupScope.Exists(http, $"This building already has a room {room.RoomNumber}.");
        }

        return ApiResponse.Ok(http, message, await RoomsQuery(db, roomId: room.Id).FirstAsync(ct), status);
    }

    private static Dictionary<string, string> Apply(Room room, RoomDetailsBody body, bool creating)
    {
        var errors = new Dictionary<string, string>();
        var number = SetupScope.Clean(body.RoomNumber);
        var name = SetupScope.Clean(body.RoomName);
        var floor = SetupScope.Clean(body.Floor);
        if (creating)
        {
            if (body.BuildingId is null)
            {
                errors["buildingId"] = "Choose the building.";
            }

            SetupScope.Required(errors, "roomNumber", number, 30, "Enter the room number, like 401.");
            SetupScope.Required(errors, "floor", floor, 30, "Enter the floor.");
        }
        else
        {
            SetupScope.RequiredIfSent(errors, "roomNumber", number, 30, "Enter the room number, like 401.");
            SetupScope.RequiredIfSent(errors, "floor", floor, 30, "Enter the floor.");
        }

        if (name?.Length > 100)
        {
            errors["roomName"] = "Keep the room name under 100 characters.";
        }

        if (body.Capacity is < 1 or > 5000)
        {
            errors["capacity"] = "Capacity must be between 1 and 5000.";
        }

        if (errors.Count == 0)
        {
            room.BuildingId = body.BuildingId ?? room.BuildingId;
            room.RoomNumber = number ?? room.RoomNumber;
            room.Floor = floor ?? room.Floor;
            room.Capacity = body.Capacity ?? room.Capacity;
            // room_name is NOT NULL in the schema; default it to the number.
            room.RoomName = name is { Length: > 0 } ? name : (creating || name is not null ? room.RoomNumber : room.RoomName);
        }

        return errors;
    }

    [GeneratedRegex("^[A-Z0-9-]{1,16}$")]
    private static partial Regex CodePattern();
}
