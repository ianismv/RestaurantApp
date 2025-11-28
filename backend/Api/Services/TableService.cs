using Api.DTOs;
using Api.Models;
using Api.Repositories;
using AutoMapper;

namespace Api.Services;

public class TableService : ITableService
{
    private readonly ITableRepository _repo;
    private readonly IMapper _mapper;

    public TableService(ITableRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<List<TableDto>> GetAllTablesAsync()
    {
        var tables = await _repo.GetAllAsync();
        return _mapper.Map<List<TableDto>>(tables);
    }

    public async Task<TableDto?> GetTableByIdAsync(int id)
    {
        var table = await _repo.GetByIdAsync(id);
        return table != null ? _mapper.Map<TableDto>(table) : null;
    }

    public async Task<TableDto> CreateTableAsync(TableCreateDto dto)
    {
        var table = _mapper.Map<Table>(dto);
        // Los valores por defecto (IsActive=true, CreatedAt) ya están en el modelo

        var created = await _repo.CreateAsync(table);
        return _mapper.Map<TableDto>(created);
    }

    public async Task UpdateTableAsync(int id, TableUpdateDto dto)
    {
        var table = await _repo.GetByIdAsync(id);
        if (table == null)
            throw new InvalidOperationException("Mesa no encontrada");

        // AutoMapper actualiza solo las propiedades del DTO
        _mapper.Map(dto, table);

        await _repo.UpdateAsync(table);
    }

    public async Task DeleteTableAsync(int id)
    {
        await _repo.DeleteAsync(id);
    }
}