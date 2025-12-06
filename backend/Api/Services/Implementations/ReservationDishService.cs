using Api.DTOs;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Services.Implementations
{
    public class ReservationDishService : IReservationDishService
    {
        private readonly IReservationDishRepository _repository;

        public ReservationDishService(IReservationDishRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ReservationDishDto>> GetByReservationIdAsync(int reservationId)
        {
            var items = await _repository.GetByReservationIdAsync(reservationId);
            return items.Select(rd => new ReservationDishDto
            {
                DishId = rd.DishId,
                DishName = rd.Dish.Name,
                Price = rd.Dish.Price,
                Quantity = rd.Quantity
            }).ToList();
        }

        public async Task AddDishAsync(int reservationId, CreateReservationDishDto dto)
        {
            await _repository.AddDishAsync(reservationId, dto.DishId, dto.Quantity);
        }

        public async Task RemoveDishAsync(int reservationId, int dishId)
        {
            await _repository.RemoveDishAsync(reservationId, dishId);
        }
    }
}
