using Api.DTOs;
using Api.Models.Entities;
using AutoMapper;

namespace Api.Utilities;

/// <summary>
/// Configuración central de AutoMapper para mapear entidades de base de datos
/// con sus respectivos Data Transfer Objects (DTOs).
/// Mantiene el backend seguro evitando exponer propiedades sensibles.
/// </summary>
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // ---------------------------------------------------------------------
        // TABLES
        // ---------------------------------------------------------------------
        CreateMap<Table, TableDto>();
        CreateMap<TableCreateDto, Table>();
        CreateMap<TableUpdateDto, Table>();


        // ---------------------------------------------------------------------
        // USERS
        // ---------------------------------------------------------------------

        // ✔ Registro: UserRegisterDto → User
        // Mapea solo campos públicos. La contraseña NO se mapea aquí.
        CreateMap<UserRegisterDto, User>();

        // ✔ User → UserDto
        // DTO seguro que se envía al frontend sin exponer PasswordHash.
        CreateMap<User, UserDto>();

        // ⚠ Eliminado (no debe existir más)
        // CreateMap<User, UserResponseDto>();


        // ---------------------------------------------------------------------
        // RESERVATIONS
        // ---------------------------------------------------------------------
        CreateMap<ReservationCreateDto, Reservation>();
        CreateMap<Reservation, ReservationDto>();

        // Para actualizar una reserva reutilizando el DTO de creación
        CreateMap<Reservation, ReservationCreateDto>();
    }
}
