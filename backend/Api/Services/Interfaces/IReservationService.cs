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
    Task<ReservationDto> CreateAsync(ReservationCreateDto dto, int userId);
    Task<ReservationDto> UpdateAsync(int id, ReservationCreateDto dto, int userId, string role);
    Task DeleteAsync(int id, int userId, string role);
}