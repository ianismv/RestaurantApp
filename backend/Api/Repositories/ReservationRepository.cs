using Api.Models;
using Api.Repositories;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly AppDbContext _context;

    public ReservationRepository(AppDbContext context)
    {
        _context = context;
    }

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

    public async Task<Reservation?> GetByTableAndRangeAsync(int tableId, DateOnly date, TimeOnly startTime, TimeOnly endTime)
    {
        return await _context.Reservations
            .FirstOrDefaultAsync(r => r.TableId == tableId && r.Date == date &&
                ((r.StartTime < endTime && r.EndTime > startTime)));
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
}