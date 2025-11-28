using Api.Repositories.Interfaces;
using Api.Data;
using Api.Models.Entities;
using Api.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories.Implementations;

public class TableRepository : ITableRepository
{
    private readonly AppDbContext _context;

    public TableRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Table>> GetAllAsync()
    {
        return await _context.Tables
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<Table?> GetByIdAsync(int id)
    {
        return await _context.Tables.FindAsync(id);
    }

    public async Task<Table> CreateAsync(Table table)
    {
        await _context.Tables.AddAsync(table);
        await _context.SaveChangesAsync();
        return table;
    }

    public async Task UpdateAsync(Table table)
    {
        _context.Tables.Update(table);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table != null)
        {
            table.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
        }
    }
}