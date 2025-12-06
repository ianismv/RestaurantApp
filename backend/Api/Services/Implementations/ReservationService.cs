using Api.DTOs;
using Api.Models;
using Api.Models.Entities;
using Api.Models.Enums;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Services.Implementations;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ITableRepository _tableRepository;
    private readonly IDishRepository _dishRepository; // Nuevo repo para platos
    private readonly IMapper _mapper;

    public ReservationService(
        IReservationRepository reservationRepository,
        ITableRepository tableRepository,
        IDishRepository dishRepository,
        IMapper mapper)
    {
        _reservationRepository = reservationRepository;
        _tableRepository = tableRepository;
        _dishRepository = dishRepository;
        _mapper = mapper;
    }

    public async Task<List<ReservationDto>> GetByDateAsync(DateOnly date, int userId, string role)
    {
        var reservations = await _reservationRepository.GetByDateAsync(date);

        if (role != "Admin")
            reservations = reservations.Where(r => r.UserId == userId).ToList();

        return _mapper.Map<List<ReservationDto>>(reservations);
    }

    public async Task<List<ReservationDto>> GetByUserIdAsync(int userId)
    {
        var reservations = await _reservationRepository.GetByUserIdAsync(userId);
        return _mapper.Map<List<ReservationDto>>(reservations);
    }

    public async Task<ReservationDto> CreateAsync(ReservationCreateDto dto, int userId)
    {
        // Validar solapamiento
        var overlap = await _reservationRepository.GetByTableAndRangeAsync(
            dto.TableId, dto.Date, dto.StartTime, dto.EndTime);

        if (overlap != null)
            throw new Exception("El horario se solapa con otra reserva");

        // Validar mesa y capacidad
        var table = await _tableRepository.GetByIdAsync(dto.TableId)
            ?? throw new Exception("Mesa no encontrada");

        if (dto.Guests > table.Capacity)
            throw new Exception($"La mesa solo tiene capacidad para {table.Capacity} personas");

        // Crear reserva
        var reservation = _mapper.Map<Reservation>(dto);
        reservation.UserId = userId;
        reservation.Status = ReservationStatus.Confirmed;

        // Manejar platos si se envían
        if (dto.Dishes != null && dto.Dishes.Any())
        {
            reservation.ReservationDishes = new List<ReservationDish>();
            foreach (var dishDto in dto.Dishes)
            {
                var dish = await _dishRepository.GetByIdAsync(dishDto.DishId)
                    ?? throw new Exception($"Dish ID {dishDto.DishId} no encontrado");

                reservation.ReservationDishes.Add(new ReservationDish
                {
                    Dish = dish,
                    DishId = dish.Id,
                    Quantity = dishDto.Quantity
                });
            }
        }

        await _reservationRepository.CreateAsync(reservation);
        return _mapper.Map<ReservationDto>(reservation);
    }

    public async Task<ReservationDto> UpdateAsync(int id, ReservationCreateDto dto, int userId, string role)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new Exception("Reserva no encontrada");

        if (reservation.UserId != userId && role != "Admin")
            throw new Exception("No tienes permiso para modificar esta reserva");

        var overlap = await _reservationRepository.GetByTableAndRangeAsync(
            dto.TableId, dto.Date, dto.StartTime, dto.EndTime);

        if (overlap != null && overlap.Id != id)
            throw new Exception("El nuevo horario se solapa con otra reserva");

        var table = await _tableRepository.GetByIdAsync(dto.TableId)
            ?? throw new Exception("Mesa no encontrada");

        if (dto.Guests > table.Capacity)
            throw new Exception("Excede la capacidad de la mesa seleccionada");

        _mapper.Map(dto, reservation);
        reservation.Status = ReservationStatus.Confirmed;

        // Actualizar platos
        if (dto.Dishes != null)
        {
            reservation.ReservationDishes.Clear();
            foreach (var dishDto in dto.Dishes)
            {
                var dish = await _dishRepository.GetByIdAsync(dishDto.DishId)
                    ?? throw new Exception($"Dish ID {dishDto.DishId} no encontrado");

                reservation.ReservationDishes.Add(new ReservationDish
                {
                    Dish = dish,
                    DishId = dish.Id,
                    Quantity = dishDto.Quantity
                });
            }
        }

        await _reservationRepository.UpdateAsync(reservation);
        return _mapper.Map<ReservationDto>(reservation);
    }

    public async Task DeleteAsync(int id, int userId, string role)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new Exception("Reserva no encontrada");

        if (reservation.UserId != userId && role != "Admin")
            throw new Exception("No tienes permiso para cancelar esta reserva");

        var now = DateTime.Now;
        var reservationDateTime = new DateTime(reservation.Date.Year, reservation.Date.Month, reservation.Date.Day,
            reservation.StartTime.Hour, reservation.StartTime.Minute, 0);

        if (reservationDateTime < now.AddHours(24))
            throw new Exception("No se puede cancelar con menos de 24 horas de antelación");

        await _reservationRepository.DeleteAsync(id);
    }
}
