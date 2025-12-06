using Api.Models;
using Api.Repositories.Interfaces;
using Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Repositories.Implementations;

public class DishRepository : IDishRepository
{
    private readonly AppDbContext _context;

    public DishRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Dish>> GetAllAsync()
    {
        return await _context.Dishes.ToListAsync();
    }

    public async Task<Dish?> GetByIdAsync(int id)
    {
        return await _context.Dishes.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task CreateAsync(Dish dish)
    {
        _context.Dishes.Add(dish);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Dish dish)
    {
        _context.Dishes.Update(dish);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var dish = await GetByIdAsync(id);
        if (dish != null)
        {
            _context.Dishes.Remove(dish);
            await _context.SaveChangesAsync();
        }
    }
}
