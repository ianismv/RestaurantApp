using Api.DTOs;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Services.Implementations
{
    public class ReservationDishService : IReservationDishService
    {
        private readonly IReservationDishRepository _repository;
        private readonly IMapper _mapper;

        public ReservationDishService(IReservationDishRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ReservationDishDto>> GetByReservationIdAsync(int reservationId)
        {
            try
            {
                var items = await _repository.GetByReservationIdAsync(reservationId);

                if (items == null || items.Count == 0)
                {
                    return new List<ReservationDishDto>(); // Retornar lista vacía si no hay platos
                }

                return items.Select(rd => new ReservationDishDto
                {
                    DishId = rd.DishId,
                    DishName = rd.Dish != null ? rd.Dish.Name : "Plato no encontrado",
                    Price = rd.Dish != null ? rd.Dish.Price : 0,
                    Category = rd.Dish != null ? rd.Dish.Category : "",
                    Quantity = rd.Quantity
                }).ToList();
            }
            catch (Exception ex)
            {
                // Opcional: loggear el error para debugging
                // _logger.LogError(ex, "Error obteniendo platos de la reserva {ReservationId}", reservationId);
                return new List<ReservationDishDto>(); // Evitar 500, retornar lista vacía
            }
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
