using Api.DTOs;

namespace Api.Services.Interfaces;

public interface IAvailabilityService
{
    Task<List<TableAvailabilityDto>> GetAvailableTablesAsync(
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        int? guests = null);
}