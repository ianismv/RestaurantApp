using Api.DTOs;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;

namespace Api.Services.Implementations;

public class AvailabilityService : IAvailabilityService
{
    private readonly ITableRepository _tableRepo;
    private readonly IReservationRepository _reservationRepo;

    public AvailabilityService(
        ITableRepository tableRepo,
        IReservationRepository reservationRepo)
    {
        _tableRepo = tableRepo;
        _reservationRepo = reservationRepo;
    }

    public async Task<List<TableAvailabilityDto>> GetAvailableTablesAsync(
        DateOnly date,
        TimeOnly startTime,
        TimeOnly endTime,
        int? guests = null)
    {
        // Validaciones
        if (endTime <= startTime)
            throw new InvalidOperationException("La hora de fin debe ser posterior a la hora de inicio");

        if (date < DateOnly.FromDateTime(DateTime.Today))
            throw new InvalidOperationException("No se pueden hacer reservas en fechas pasadas");

        // Obtener todas las mesas activas
        var allTables = await _tableRepo.GetAllAsync();

        // Obtener IDs de mesas reservadas en ese rango
        var reservedTableIds = await _reservationRepo.GetReservedTableIdsAsync(date, startTime, endTime);

        // Filtrar mesas disponibles
        var availableTables = allTables
            .Where(t => !reservedTableIds.Contains(t.Id))
            .Where(t => guests == null || t.Capacity >= guests)
            .Select(t => new TableAvailabilityDto(
                Id: t.Id,
                Name: t.Name,
                Capacity: t.Capacity,
                Location: t.Location,
                IsAvailable: !reservedTableIds.Contains(t.Id) // ✅ reflejar ocupadas
            ))
            .ToList();

        return availableTables;
    }
}
