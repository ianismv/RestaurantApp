using Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Repositories.Interfaces
{
    public interface IReservationDishRepository
    {
        Task<List<ReservationDish>> GetByReservationIdAsync(int reservationId);
        Task AddDishAsync(int reservationId, int dishId, int quantity);
        Task RemoveDishAsync(int reservationId, int dishId);
    }
}
