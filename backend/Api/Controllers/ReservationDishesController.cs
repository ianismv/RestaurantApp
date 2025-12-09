using Api.DTOs;
using Api.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Api.Services.Interfaces; // <- usar la interfaz


namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/reservations/{reservationId}/dishes")]
    public class ReservationDishesController : ControllerBase
    {
        private readonly IReservationDishService _service;

        public ReservationDishesController(IReservationDishService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(int reservationId)
        {
            var items = await _service.GetByReservationIdAsync(reservationId);
            return Ok(items);
        }

        [HttpPut("{dishId}")]
        public async Task<IActionResult> UpdateDish(int reservationId, int dishId, [FromBody] UpdateReservationDishDto dto)
        {
            var success = await _service.UpdateDishQuantity(reservationId, dishId, dto.Quantity);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> AddDish(int reservationId, [FromBody] CreateReservationDishDto dto)
        {
            await _service.AddDishAsync(reservationId, dto);
            return NoContent();
        }

        [HttpDelete("{dishId}")]
        public async Task<IActionResult> RemoveDish(int reservationId, int dishId)
        {
            await _service.RemoveDishAsync(reservationId, dishId);
            return NoContent();
        }
    }
}

