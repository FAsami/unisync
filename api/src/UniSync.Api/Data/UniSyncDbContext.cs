using Microsoft.EntityFrameworkCore;

namespace UniSync.Api.Data;

public sealed class UniSyncDbContext(DbContextOptions<UniSyncDbContext> options) : DbContext(options)
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<OtpTransaction> OtpTransactions => Set<OtpTransaction>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<ClassRepresentative> ClassRepresentatives => Set<ClassRepresentative>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Columns with database defaults: EF omits them on insert when unset, so
        // Postgres fills id / created_at / updated_at instead of writing CLR defaults.
        modelBuilder.Entity<Account>(e =>
        {
            e.ToTable("account", "user");
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<Session>(e =>
        {
            e.ToTable("session", "user");
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<OtpTransaction>(e =>
        {
            e.ToTable("otp_transaction", "user");
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<Profile>(e => e.ToTable("profile", "user"));
        modelBuilder.Entity<Section>(e => e.ToTable("section", "academic"));
        modelBuilder.Entity<ClassRepresentative>(e => e.ToTable("class_representative", "academic"));
    }
}
