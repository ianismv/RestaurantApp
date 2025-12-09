using Api.Models.Entities;
using Api.Models.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Repositories.Interfaces;

public interface IReservationRepository
{
    Task<List<Reservation>> GetByDateAsync(DateOnly date);
    Task<List<Reservation>> GetByUserIdAsync(int userId);
    Task<Reservation?> GetByIdAsync(int id);
    Task<Reservation?> GetByTableAndRangeAsync(
    int tableId, DateOnly date, TimeOnly startTime, TimeOnly endTime, int? excludeReservationId = null);
    Task CreateAsync(Reservation reservation);

    Task UpdateAsync(Reservation reservation);
    Task DeleteAsync(int id);

    // ✅ NUEVO MÉTODO - Para consulta de disponibilidad
    Task<List<int>> GetReservedTableIdsAsync(DateOnly date, TimeOnly startTime, TimeOnly endTime);
    Task<IEnumerable<Reservation>> GetAllAsync();


}