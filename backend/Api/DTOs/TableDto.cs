// DTOs/TableDtos.cs
namespace Api.DTOs;

public record TableDto(
    int Id,
    string Name,
    int Capacity,
    string Location,
    bool IsActive
);

public record TableCreateDto(
    string Name,
    int Capacity,
    string Location
);

public record TableUpdateDto(
    string Name,
    int Capacity,
    string Location,
    bool IsActive
);