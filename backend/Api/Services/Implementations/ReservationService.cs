using Api.Services.Interfaces;
using Api.DTOs;
using Api.Models.Entities;
using Api.Models.Enums;
using Api.Repositories.Interfaces;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Services.Implementations;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ITableRepository _tableRepository;  // ← CORREGIDO: usamos repositorio de mesas
    private readonly IMapper _mapper;

    public ReservationService(
        IReservationRepository reservationRepository,
        ITableRepository tableRepository,   // ← Inyectamos el repo de mesas
        IMapper mapper)
    {
        _reservationRepository = reservationRepository;
        _tableRepository = tableRepository;
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
        // 1. Validar solapamiento
        var overlap = await _reservationRepository.GetByTableAndRangeAsync(
            dto.TableId, dto.Date, dto.StartTime, dto.EndTime);

        if (overlap != null)
            throw new Exception("El horario se solapa con otra reserva");

        // 2. Validar mesa y capacidad
        var table = await _tableRepository.GetByIdAsync(dto.TableId)
            ?? throw new Exception("Mesa no encontrada");

        if (dto.Guests > table.Capacity)
            throw new Exception($"La mesa solo tiene capacidad para {table.Capacity} personas");

        // 3. Crear reserva
        var reservation = _mapper.Map<Reservation>(dto);
        reservation.UserId = userId;
        reservation.Status = ReservationStatus.Confirmed;

        await _reservationRepository.CreateAsync(reservation);

        return _mapper.Map<ReservationDto>(reservation);
    }

    public async Task<ReservationDto> UpdateAsync(int id, ReservationCreateDto dto, int userId, string role)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new Exception("Reserva no encontrada");

        if (reservation.UserId != userId && role != "Admin")
            throw new Exception("No tienes permiso para modificar esta reserva");

        // Validar solapamiento (excluyendo la propia reserva)
        var overlap = await _reservationRepository.GetByTableAndRangeAsync(
            dto.TableId, dto.Date, dto.StartTime, dto.EndTime);

        if (overlap != null && overlap.Id != id)
            throw new Exception("El nuevo horario se solapa con otra reserva");

        // Validar capacidad de la nueva mesa
        var table = await _tableRepository.GetByIdAsync(dto.TableId)
            ?? throw new Exception("Mesa no encontrada");

        if (dto.Guests > table.Capacity)
            throw new Exception("Excede la capacidad de la mesa seleccionada");

        _mapper.Map(dto, reservation);
        reservation.Status = ReservationStatus.Confirmed;

        await _reservationRepository.UpdateAsync(reservation);

        return _mapper.Map<ReservationDto>(reservation);
    }

    public async Task DeleteAsync(int id, int userId, string role)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new Exception("Reserva no encontrada");

        if (reservation.UserId != userId && role != "Admin")
            throw new Exception("No tienes permiso para cancelar esta reserva");

        // Regla de negocio: no se puede cancelar con menos de 24h
        var now = DateTime.Now;
        var reservationDateTime = new DateTime(reservation.Date.Year, reservation.Date.Month, reservation.Date.Day,
            reservation.StartTime.Hour, reservation.StartTime.Minute, 0);

        if (reservationDateTime < now.AddHours(24))
            throw new Exception("No se puede cancelar con menos de 24 horas de antelación");

        await _reservationRepository.DeleteAsync(id);
    }
}