using Api.Models.Entities;
using Api.Models.Enums;
using Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Repositories.Implementations;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _context;

    public ReservationRepository(AppDbContext context)
    {
        _context = context;
    }

    // ✅ TUS MÉTODOS EXISTENTES (NO TOCAR)
    public async Task<List<Reservation>> GetByDateAsync(DateOnly date)
    {
        return await _context.Reservations
            .Where(r => r.Date == date)
            .Include(r => r.User)
            .Include(r => r.Table)
            .ToListAsync();
    }

    public async Task<List<Reservation>> GetByUserIdAsync(int userId)
    {
        return await _context.Reservations
            .Where(r => r.UserId == userId)
            .Include(r => r.Table)
            .ToListAsync();
    }

    public async Task<Reservation?> GetByIdAsync(int id)
    {
        return await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reservation?> GetByTableAndRangeAsync(
    int tableId, DateOnly date, TimeOnly startTime, TimeOnly endTime, int? excludeReservationId = null)
    {
        return await _context.Reservations
            .FirstOrDefaultAsync(r =>
                r.TableId == tableId &&
                r.Date == date &&
                r.StartTime < endTime &&
                r.EndTime > startTime &&
                (!excludeReservationId.HasValue || r.Id != excludeReservationId.Value)
            );
    }

    public async Task CreateAsync(Reservation reservation)
    {
        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Reservation reservation)
    {
        _context.Reservations.Update(reservation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var reservation = await GetByIdAsync(id);
        if (reservation != null)
        {
            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
        }
    }

    // ✅ NUEVO MÉTODO - Agregar al final
    /// <summary>
    /// Obtiene los IDs de mesas que tienen reservas en el rango especificado
    /// </summary>
    public async Task<List<int>> GetReservedTableIdsAsync(DateOnly date, TimeOnly startTime, TimeOnly endTime)
    {
        return await _context.Reservations
            .Where(r =>
                r.Date == date &&
                r.Status != ReservationStatus.Cancelled &&
                r.StartTime < endTime &&
                r.EndTime > startTime)
            .Select(r => r.TableId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<IEnumerable<Reservation>> GetAllAsync()
    {
        return await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Table)
            .Include(r => r.ReservationDishes)
                .ThenInclude(rd => rd.Dish)
            .ToListAsync();
    }

}