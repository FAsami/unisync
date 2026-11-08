using Microsoft.EntityFrameworkCore;

namespace UniSync.Api.Data;

// Columns the department setup screens edit. Kept apart from Entities.cs so the
// read-side mapping stays small; both halves map the same tables.

public sealed partial class Department
{
    public string? Description { get; set; }
}

public sealed partial class Batch
{
    public int Year { get; set; }
    public int CurrentSemester { get; set; }
    public int SemesterCount { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}

public sealed partial class Section
{
    public int? Capacity { get; set; }
}

public sealed partial class Course
{
    public Guid DepartmentId { get; set; }
    public string? Description { get; set; }
    public decimal CreditHours { get; set; }
    public int Semester { get; set; }
    /// <summary>THEORY | LAB</summary>
    public string CourseType { get; set; } = "THEORY";
    public bool IsActive { get; set; } = true;
}

public sealed partial class CourseOffering
{
    public string AcademicYear { get; set; } = "";
}

public sealed partial class Building
{
    public string Address { get; set; } = "";
}

public sealed partial class Room
{
    public string Floor { get; set; } = "";
    public int? Capacity { get; set; }
}

public sealed partial class TeacherProfile
{
    public string Designation { get; set; } = "";
    /// <summary>Optional academic.faculty (school) grouping.</summary>
    public Guid? FacultyId { get; set; }
}

public sealed partial class ClassRepresentative
{
    public DateOnly? AppointedAt { get; set; }
}

internal static class SetupModel
{
    public static void Configure(ModelBuilder modelBuilder)
    {
        // Ids are generated in the database when the API doesn't choose one.
        modelBuilder.Entity<Department>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<Batch>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<Section>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<Course>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<CourseOffering>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<Routine>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<Building>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<Room>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<TeacherProfile>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        modelBuilder.Entity<ClassRepresentative>().Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
    }
}
