namespace UniSync.Api.Tests.Infrastructure;

/// <summary>
/// A small timetable around one student, for schedule and class-change tests.
/// Mondays, section A: CSE101 09:00–11:00 in room A (teacher Rafiq), CSE102
/// 11:30–12:30 written in the legacy "+06" form with a free-text room (teacher Sumi).
/// Section B: CSE999 10:00–11:00, no room (teacher Rafiq).
/// </summary>
public sealed record TimetableWorld(
    SeededStudent Student,
    Guid TeacherId, string TeacherPhone,
    Guid OtherTeacherId, string OtherTeacherPhone,
    Guid Cse101, Guid Cse102, Guid Cse999,
    Guid OtherSectionId, Guid RoomA, Guid RoomB)
{
    public static async Task<TimetableWorld> BuildAsync(string cs, CancellationToken ct)
    {
        var student = await Seed.StudentAsync(cs, ct: ct);
        var (teacherId, teacherPhone) = await Seed.TeacherAsync(cs, student.BatchId, "Rafiq", "Islam", ct);
        var (otherTeacherId, otherTeacherPhone) = await Seed.TeacherAsync(cs, student.BatchId, "Sumi", "Akter", ct);
        var roomA = await Seed.RoomAsync(cs, "402", "Academic Building", ct);
        var roomB = await Seed.RoomAsync(cs, "105", "Science Building", ct);

        var cse101 = await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "CSE101", student.SectionId, student.BatchId, teacherId, ct),
            DayOfWeek.Monday, "09:00", "11:00", ct, roomId: roomA);
        var cse102 = await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "CSE102", student.SectionId, student.BatchId, otherTeacherId, ct),
            DayOfWeek.Monday, "11:30:00+06", "12:30:00+06", ct, metadataRoom: "Lab 3");

        var otherSection = await Seed.ScalarAsync<Guid>(cs, "INSERT INTO academic.section (name, batch_id) VALUES ('B', @b) RETURNING id", ct, ("b", student.BatchId));
        var cse999 = await Seed.RoutineAsync(cs, await Seed.OfferingAsync(cs, "CSE999", otherSection, student.BatchId, teacherId, ct),
            DayOfWeek.Monday, "10:00", "11:00", ct);

        return new TimetableWorld(student, teacherId, teacherPhone, otherTeacherId, otherTeacherPhone,
            cse101, cse102, cse999, otherSection, roomA, roomB);
    }
}
