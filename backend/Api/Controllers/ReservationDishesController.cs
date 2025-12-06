using Api.DTOs;
using Api.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/reservations/{reservationId}/dishes")]
    public class ReservationDishesController : ControllerBase
    {
        private readonly ReservationDishService _service;

        public ReservationDishesController(ReservationDishService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(int reservationId)
        {
            var items = await _service.GetByReservationIdAsync(reservationId);
            return Ok(items);
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

