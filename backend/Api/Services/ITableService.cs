using Api.DTOs;

namespace Api.Services;

public interface ITableService
{
    Task<List<TableDto>> GetAllTablesAsync();
    Task<TableDto?> GetTableByIdAsync(int id);
    Task<TableDto> CreateTableAsync(TableCreateDto dto);
    Task UpdateTableAsync(int id, TableUpdateDto dto);
    Task DeleteTableAsync(int id);
}