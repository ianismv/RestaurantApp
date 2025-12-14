using Api.DTOs;
using Api.Models.Entities;
using Api.Models.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Services.Interfaces;

public interface IReservationService
{
    Task<List<ReservationDto>> GetByDateAsync(DateOnly date, int userId, string role);
    Task<List<ReservationDto>> GetByUserIdAsync(int userId);
    Task<ReservationDto> GetByIdAsync(int id, int userId, string role);

    /// <summary>
    /// Crea una nueva reserva. Opcionalmente se pueden agregar platos a la reserva.
    /// </summary>
    Task<ReservationDto> CreateAsync(ReservationCreateDto dto, int userId);
    Task<ReservationDto> UpdateAsync(int id, ReservationCreateDto dto, int userId, string role);
    Task DeleteAsync(int id, int userId, string role);
    Task<IEnumerable<ReservationAdminDto>> GetAllAsync();
    Task CancelAsync(int id, int userId, string role);




}