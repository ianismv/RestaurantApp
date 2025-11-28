using Api.Models;
using Api.Models.Entities;
using Api.Models.Enums;
using Api.Data;
using Serilog;

namespace Api.Data.Seeds;

public static class SeedData
{
    public static void Initialize(AppDbContext context, IConfiguration config)
    {
        if (!context.Users.Any())
        {
            var adminPassword = Guid.NewGuid().ToString("N").Substring(0, 12); // Random 12-char password
            var hash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            context.Users.Add(new User
            {
                Email = "admin@bodegon.com",
                PasswordHash = hash,
                Role = "Admin"
            });
            context.SaveChanges();
            Log.Information("Admin user created. Email: admin@bodegon.com, Password: {Password}", adminPassword);
        }

        if (!context.Tables.Any())
        {
            context.Tables.AddRange(
                new Table { Name = "Mesa 1", Capacity = 2, Location = "Ventana" },
                new Table { Name = "Mesa 2", Capacity = 4, Location = "Interior" },
                new Table { Name = "Mesa 3", Capacity = 6, Location = "Terraza" },
                new Table { Name = "Mesa 4", Capacity = 2, Location = "Ventana" },
                new Table { Name = "Mesa 5", Capacity = 4, Location = "Interior" },
                new Table { Name = "Mesa 6", Capacity = 8, Location = "Privado" }
            );
            context.SaveChanges();
        }

        if (!context.Dishes.Any())
        {
            context.Dishes.AddRange(
                new Dish { Name = "Asado", Price = 25.99m, Category = "Principal" },
                new Dish { Name = "Empanadas", Price = 10.50m, Category = "Entrada" },
                new Dish { Name = "Flan", Price = 5.99m, Category = "Postre" }
            );
            context.SaveChanges();
        }
    }
}