using Api.Data;
using Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene lista de TODOS los usuarios (incluye inactivos)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? includeInactive)
    {
        var query = _context.Users.AsQueryable();

        // Por defecto solo activos, a menos que se pida incluir inactivos
        if (includeInactive != true)
        {
            query = query.Where(u => u.IsActive);
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDetailDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                TotalReservations = u.Reservations!.Count()
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Obtiene un usuario por ID con detalles completos
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users
            .Include(u => u.Reservations)
            .Where(u => u.Id == id)
            .Select(u => new UserDetailDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
                TotalReservations = u.Reservations!.Count()
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        return Ok(user);
    }

    /// <summary>
    /// Actualiza información de un usuario (rol, estado activo, nombre, email)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Reservations)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        // ------------------------------------------------------------------
        // REGLA: un ADMIN no puede cambiar su email
        // ------------------------------------------------------------------
        if (user.Role == "Admin" && !string.IsNullOrWhiteSpace(dto.Email))
        {
            if (!string.Equals(dto.Email, user.Email, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "No está permitido modificar el email de un administrador"
                });
            }
        }

        // ------------------------------------------------------------------
        // EMAIL (solo si NO es admin)
        // ------------------------------------------------------------------
        if (user.Role != "Admin" &&
            !string.IsNullOrWhiteSpace(dto.Email) &&
            dto.Email != user.Email)
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email && u.Id != id);

            if (emailExists)
                return BadRequest(new { message = "El email ya está en uso" });

            user.Email = dto.Email;
        }

        // ------------------------------------------------------------------
        // NAME
        // ------------------------------------------------------------------
        if (!string.IsNullOrWhiteSpace(dto.Name))
            user.Name = dto.Name;

        // ------------------------------------------------------------------
        // ROLE (opcional, si lo vas a permitir)
        // Recomendación: NO permitir cambiar roles acá
        // ------------------------------------------------------------------
        // if (!string.IsNullOrEmpty(dto.Role))
        //     user.Role = dto.Role;

        // ------------------------------------------------------------------
        // ACTIVE
        // ------------------------------------------------------------------
        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();

        return Ok(new UserDetailDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            TotalReservations = user.Reservations?.Count() ?? 0
        });
    }

    /// <summary>
    /// Desactiva un usuario (soft delete)
    /// </summary>
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        // No permitir desactivar al admin que está haciendo la petición
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        if (user.Id == currentUserId)
            return BadRequest(new { message = "No puedes desactivar tu propia cuenta" });

        user.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Activa un usuario
    /// </summary>
    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        user.IsActive = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Elimina permanentemente un usuario (PELIGROSO - solo si no tiene reservas)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users
            .Include(u => u.Reservations)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        // No eliminar tu propia cuenta
        if (user.Id == currentUserId)
            return BadRequest(new { message = "No puedes eliminar tu propia cuenta" });

        // No eliminar al único admin
        if (user.Role == "Admin")
        {
            var totalAdmins = await _context.Users.CountAsync(u => u.Role == "Admin" && u.Id != user.Id);
            if (totalAdmins == 0)
            {
                return BadRequest(new { message = "No se puede eliminar al único administrador restante" });
            }
        }

        // Verificar si tiene reservas
        if (user.Reservations?.Any() == true)
            return BadRequest(new { message = "No se puede eliminar un usuario con reservas. Considera desactivarlo en su lugar." });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}