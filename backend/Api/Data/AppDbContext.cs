using Api.Models;
using Api.Models.Entities;
using Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<ReservationDish> ReservationDishes => Set<ReservationDish>();


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

        // CONFIGURACIÓN NUEVA: relación muchos-a-muchos Reservation-Dish
        modelBuilder.Entity<ReservationDish>()
            .HasKey(rd => new { rd.ReservationId, rd.DishId }); // clave compuesta

        modelBuilder.Entity<ReservationDish>()
            .HasOne(rd => rd.Reservation)
            .WithMany(r => r.ReservationDishes)
            .HasForeignKey(rd => rd.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReservationDish>()
            .HasOne(rd => rd.Dish)
            .WithMany(d => d.ReservationDishes)
            .HasForeignKey(rd => rd.DishId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}