using Api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Services.Interfaces
{
    public interface IReservationDishService
    {
        Task<List<ReservationDishDto>> GetByReservationIdAsync(int reservationId);
        Task AddDishAsync(int reservationId, CreateReservationDishDto dto);
        Task RemoveDishAsync(int reservationId, int dishId);
        Task<bool> UpdateDishQuantity(int reservationId, int dishId, int quantity);
        
    }
}
