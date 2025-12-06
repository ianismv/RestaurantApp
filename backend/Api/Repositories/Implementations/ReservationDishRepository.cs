using Api.Models;
using Api.Repositories.Interfaces;
using Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Repositories.Implementations
{
    public class ReservationDishRepository : IReservationDishRepository
    {
        private readonly AppDbContext _context;

        public ReservationDishRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReservationDish>> GetByReservationIdAsync(int reservationId)
        {
            return await _context.ReservationDishes
                .Include(rd => rd.Dish)
                .Where(rd => rd.ReservationId == reservationId)
                .ToListAsync();
        }

        public async Task AddDishAsync(int reservationId, int dishId, int quantity)
        {
            var existing = await _context.ReservationDishes
                .FirstOrDefaultAsync(rd => rd.ReservationId == reservationId && rd.DishId == dishId);

            if (existing != null)
            {
                existing.Quantity += quantity;
            }
            else
            {
                _context.ReservationDishes.Add(new ReservationDish
                {
                    ReservationId = reservationId,
                    DishId = dishId,
                    Quantity = quantity
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveDishAsync(int reservationId, int dishId)
        {
            var existing = await _context.ReservationDishes
                .FirstOrDefaultAsync(rd => rd.ReservationId == reservationId && rd.DishId == dishId);

            if (existing != null)
            {
                _context.ReservationDishes.Remove(existing);
                await _context.SaveChangesAsync();
            }
        }
    }
}
