using Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Services.Interfaces
{
    public interface IDishService
    {
        Task<List<DishDto>> GetAllAsync();
        Task<DishDto?> GetByIdAsync(int id);
        Task<DishDto> CreateAsync(CreateDishDto dto);
        Task<DishDto> UpdateAsync(int id, CreateDishDto dto);
        Task DeleteAsync(int id);
    }
}
