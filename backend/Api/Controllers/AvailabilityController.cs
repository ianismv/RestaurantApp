using Api.DTOs;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _service;

    public AvailabilityController(IAvailabilityService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene las mesas disponibles en un rango de fecha/hora
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TableAvailabilityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<TableAvailabilityDto>>> GetAvailability(
        [FromQuery] string date,
        [FromQuery] string startTime,
        [FromQuery] string endTime,
        [FromQuery] int? guests = null)
    {
        if (!DateOnly.TryParse(date, out var reservationDate))
            return BadRequest(new { error = "Fecha inválida. Use formato YYYY-MM-DD" });

        if (!TimeOnly.TryParse(startTime, out var start))
            return BadRequest(new { error = "Hora de inicio inválida. Use formato HH:mm" });

        if (!TimeOnly.TryParse(endTime, out var end))
            return BadRequest(new { error = "Hora de fin inválida. Use formato HH:mm" });

        try
        {
            var availableTables = await _service.GetAvailableTablesAsync(
                reservationDate, start, end, guests);

            return Ok(availableTables);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}