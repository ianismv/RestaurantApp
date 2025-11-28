using Api.Models.Entities;
using Api.Models.Enums;

namespace Api.Repositories.Interfaces;

public interface ITableRepository
{
    Task<List<Table>> GetAllAsync();
    Task<Table?> GetByIdAsync(int id);
    Task<Table> CreateAsync(Table table);
    Task UpdateAsync(Table table);
    Task DeleteAsync(int id);
}