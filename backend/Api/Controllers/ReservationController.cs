using Api.DTOs;
using Api.Data;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly AppDbContext _context;

    public ReservationsController(IReservationService reservationService, AppDbContext context)
    {
        _reservationService = reservationService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateOnly? date)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        if (date.HasValue)
        {
            var reservations = await _reservationService.GetByDateAsync(date.Value, userId, role);
            return Ok(reservations);
        }
        else
        {
            var reservations = await _reservationService.GetByUserIdAsync(userId);
            return Ok(reservations);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        try
        {
            var reservation = await _reservationService.GetByIdAsync(id, userId, role);
            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Crea una reserva. 
    /// - Admin: puede especificar UserEmail para crear reserva a nombre de otro usuario
    /// - User: crea reserva para sí mismo (usa el userId del token)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReservationCreateDto dto)
    {
        int userId;
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        // 🔹 Si es Admin y viene userEmail, buscar usuario por email
        if (role == "Admin" && !string.IsNullOrEmpty(dto.UserEmail))
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.UserEmail && u.IsActive);

            if (user == null)
                return BadRequest("No existe un usuario activo con ese email");

            userId = user.Id;
        }
        // 🔹 Si es User normal o Admin sin userEmail, usar el userId del token
        else
        {
            userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        try
        {
            var reservation = await _reservationService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ReservationCreateDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        try
        {
            var updated = await _reservationService.UpdateAsync(id, dto, userId, role);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        try
        {
            await _reservationService.DeleteAsync(id, userId, role);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var reservations = await _reservationService.GetAllAsync();
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al obtener reservas", details = ex.Message });
        }
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        try
        {
            await _reservationService.CancelAsync(id, userId, role);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}