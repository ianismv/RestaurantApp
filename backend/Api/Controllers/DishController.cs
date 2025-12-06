using Api.DTOs;
using Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DishController : ControllerBase
    {
        private readonly IDishService _dishService;

        public DishController(IDishService dishService)
        {
            _dishService = dishService;
        }

        // GET: api/dish
        [HttpGet]
        public async Task<ActionResult<List<DishDto>>> GetAll()
        {
            var dishes = await _dishService.GetAllAsync();
            return Ok(dishes);
        }

        // GET: api/dish/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DishDto>> GetById(int id)
        {
            var dish = await _dishService.GetByIdAsync(id);
            if (dish == null) return NotFound();
            return Ok(dish);
        }

        // POST: api/dish
        [HttpPost]
        [Authorize(Roles = "Admin")] // Solo admins pueden crear platos
        public async Task<ActionResult<DishDto>> Create([FromBody] CreateDishDto dto)
        {
            var created = await _dishService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/dish/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DishDto>> Update(int id, [FromBody] CreateDishDto dto)
        {
            // Reutilizamos CreateDishDto como UpdateDishDto
            var updated = await _dishService.UpdateAsync(id, dto);
            return Ok(updated);
        }

        // DELETE: api/dish/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _dishService.DeleteAsync(id);
            return NoContent();
        }
    }
}
