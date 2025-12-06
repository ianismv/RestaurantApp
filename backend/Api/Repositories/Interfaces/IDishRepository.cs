using Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Repositories.Interfaces;

public interface IDishRepository
{
    Task<List<Dish>> GetAllAsync();
    Task<Dish?> GetByIdAsync(int id);
    Task CreateAsync(Dish dish);
    Task UpdateAsync(Dish dish);
    Task DeleteAsync(int id);
}