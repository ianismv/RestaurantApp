using Api.DTOs;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Api.Repositories;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReservationCreateDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var reservation = await _reservationService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(Get), new { id = reservation.Id }, reservation);
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
            // Devuelve JSON con mensaje de error
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
            return Ok(reservations); // Devuelve IEnumerable<ReservationAdminDto>
        }
        catch (Exception ex)
        {
            // En caso de error inesperado
            return StatusCode(500, new { message = "Error al obtener reservas", details = ex.Message });
        }
    }
}
