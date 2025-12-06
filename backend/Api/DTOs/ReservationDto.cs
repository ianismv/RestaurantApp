using Api.Models.Entities;
using Api.Models.Enums;
namespace Api.DTOs;

public class ReservationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TableId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int Guests { get; set; }
    public ReservationStatus Status { get; set; }
    public string Notes { get; set; } = string.Empty;
    public List<ReservationDishDto>? Dishes { get; set; }

}
