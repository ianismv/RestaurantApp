using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models.Entities;
using Api.Models.Enums;
using System.Threading.Tasks;

namespace Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/tables")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TablesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Tables.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return NotFound();
        return Ok(table);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Table table)
    {
        _context.Tables.Add(table);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = table.Id }, table);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Table updatedTable)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return NotFound();

        table.Name = updatedTable.Name;
        table.Capacity = updatedTable.Capacity;
        table.Location = updatedTable.Location;
        table.IsActive = updatedTable.IsActive;


        await _context.SaveChangesAsync();
        return Ok(table);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return NotFound();

        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}