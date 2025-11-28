using Api.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

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
            return BadRequest(ex.Message);
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
}