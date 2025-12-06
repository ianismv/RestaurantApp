using Api.DTOs;
using Api.Models;
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
        CreateMap<UserRegisterDto, User>();
        CreateMap<User, UserDto>();

        // ---------------------------------------------------------------------
        // RESERVATIONS
        // ---------------------------------------------------------------------
        CreateMap<ReservationCreateDto, Reservation>()
            .ForMember(dest => dest.ReservationDishes, opt => opt.Ignore());
        // Se maneja manualmente en el Service

        CreateMap<Reservation, ReservationDto>();
        CreateMap<Reservation, ReservationCreateDto>();

        // DISHES
        CreateMap<Dish, DishDto>();
        CreateMap<CreateDishDto, Dish>();

        // ---------------------------------------------------------------------
        // RESERVATION DISHES
        // ---------------------------------------------------------------------
        CreateMap<ReservationDish, ReservationDishDto>()
            .ForMember(dest => dest.DishName, opt => opt.MapFrom(src => src.Dish.Name))
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Dish.Price));
    }
}
