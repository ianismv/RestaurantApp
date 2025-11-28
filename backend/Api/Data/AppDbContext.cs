using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Dish> Dishes => Set<Dish>();  

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Table - Configurar nombre explícito
        modelBuilder.Entity<Table>().ToTable("Tables");

        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Reservation - Relación con User
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Reservation - Relación con Table
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Table)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TableId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}