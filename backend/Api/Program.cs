using Api.Data;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using Api.Repositories.Implementations;
using Api.Services.Implementations;
using Api.Data.Seeds;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------------------------------
// 1. Logging (Serilog)
// ----------------------------------------------------------------------------
builder.Host.UseSerilog((ctx, lc) => lc
    .MinimumLevel.Information()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

// ----------------------------------------------------------------------------
// 2. Configuración y Dependencias
// ----------------------------------------------------------------------------
var config = builder.Configuration;

// Base de datos (PostgreSQL)
var connectionString = config.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => npgsql.MigrationsAssembly("Api")));

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Repositorios y Servicios
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<ITableRepository, TableRepository>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<IAvailabilityService, AvailabilityService>(); // ✅ AGREGAR
builder.Services.AddScoped<IDishService, DishService>();
builder.Services.AddScoped<IDishRepository, DishRepository>();
builder.Services.AddScoped<IReservationDishRepository, ReservationDishRepository>(); // <
builder.Services.AddScoped<IReservationDishService, ReservationDishService>(); // <


// ----------------------------------------------------------------------------
// 3. Autenticación JWT (HS512)
// ----------------------------------------------------------------------------
var jwtSecret = config["JWT_SECRET"] ?? Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? throw new InvalidOperationException("JWT_SECRET no configurado");
var key = Encoding.UTF8.GetBytes(jwtSecret);

// Validar que la clave secreta tenga la longitud adecuada para HMACSHA512
// (Generalmente se requieren 64 bytes o más)
if (key.Length < 64)
{
    Log.Warning("JWT_SECRET es demasiado corto para HMACSHA512. Considera una clave de al menos 64 bytes.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["JWT_ISSUER"] ?? "restaurantApp",
            ValidAudience = config["JWT_AUDIENCE"] ?? "restaurantApp_client",
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

// ----------------------------------------------------------------------------
// 4. CORS (CORRECCIÓN CRÍTICA)
// ----------------------------------------------------------------------------

// Definimos el origen del frontend (Vite) de forma explícita,
// ya que Vite por defecto corre en 5173. ESTE ES EL ORIGEN CORRECTO.
const string FrontendOrigin = "http://localhost:8080"; //<---- nuevo front usa 8080

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(FrontendOrigin) // <--- ¡USAR 5173!
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

// ----------------------------------------------------------------------------
// 5. Controllers, Swagger, y Mapeo
// ----------------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Restaurant API", Version = "v3.0" });

    // Configuración de JWT en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando Bearer. Ejemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ----------------------------------------------------------------------------
// 6. Configuración de Middleware y Ejecución
// ----------------------------------------------------------------------------
var app = builder.Build();

// Migraciones automáticas + Seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Ejecuta las migraciones si es necesario
    db.Database.Migrate(); 
    // Si la base de datos está vacía, la puebla con datos iniciales (admin)
    SeedData.Initialize(db, config);
}

// Middlewares
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "RestaurantApp"));
}

// IMPORTANTE: El middleware UseCors debe ir antes de UseAuthentication/UseAuthorization
app.UseCors("AllowFrontend"); 
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", time = DateTime.UtcNow }));

app.Run();