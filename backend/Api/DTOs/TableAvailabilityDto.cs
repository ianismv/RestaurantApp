namespace Api.DTOs;

public record TableAvailabilityDto(
    int Id,
    string Name,
    int Capacity,
    string Location,
    bool IsAvailable
);