using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class ReservationCreateDto
{
    [Required(ErrorMessage = "Table ID is required")]
    public int TableId { get; set; }

    [Required(ErrorMessage = "Date is required")]
    public DateOnly Date { get; set; }

    [Required(ErrorMessage = "Start time is required")]
    public TimeOnly StartTime { get; set; }

    [Required(ErrorMessage = "End time is required")]
    public TimeOnly EndTime { get; set; }

    [Required(ErrorMessage = "Number of guests is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Guests must be at least 1")]
    public int Guests { get; set; }

    public string? Notes { get; set; }

    public List<ReservationDishDto>? Dishes { get; set; }

    // 🔹 Nuevo campo
    [Required]
    public string Status { get; set; } = "Pending";
}
