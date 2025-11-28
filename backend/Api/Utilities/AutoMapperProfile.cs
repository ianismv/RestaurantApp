using Api.DTOs;
using Api.Models;
using AutoMapper;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Api.Utilities;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<Table, TableDto>();
        CreateMap<TableCreateDto, Table>();
        CreateMap<TableUpdateDto, Table>();
        CreateMap<UserRegisterDto, User>();
        CreateMap<ReservationCreateDto, Reservation>();
        CreateMap<Reservation, ReservationDto>();
        CreateMap<Reservation, ReservationCreateDto>(); // For update mapping
    }
}