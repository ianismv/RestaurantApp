using Api.DTOs;
using Api.Models;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Services.Implementations;

public class DishService : IDishService
{
    private readonly IDishRepository _dishRepository;
    private readonly IMapper _mapper;

    public DishService(IDishRepository dishRepository, IMapper mapper)
    {
        _dishRepository = dishRepository;
        _mapper = mapper;
    }

    public async Task<List<DishDto>> GetAllAsync()
    {
        var dishes = await _dishRepository.GetAllAsync();
        return _mapper.Map<List<DishDto>>(dishes);
    }

    public async Task<DishDto?> GetByIdAsync(int id)
    {
        var dish = await _dishRepository.GetByIdAsync(id);
        return dish == null ? null : _mapper.Map<DishDto>(dish);
    }

    public async Task<DishDto> CreateAsync(CreateDishDto dto)
    {
        var dish = _mapper.Map<Dish>(dto);
        await _dishRepository.CreateAsync(dish);
        return _mapper.Map<DishDto>(dish);
    }

    public async Task<DishDto> UpdateAsync(int id, CreateDishDto dto)
    {
        var existing = await _dishRepository.GetByIdAsync(id);
        if (existing == null)
            throw new KeyNotFoundException("Dish not found");

        _mapper.Map(dto, existing);
        await _dishRepository.UpdateAsync(existing);
        return _mapper.Map<DishDto>(existing);
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await _dishRepository.GetByIdAsync(id);
        if (existing == null)
            throw new KeyNotFoundException("Dish not found");

        await _dishRepository.DeleteAsync(id);
    }
}
