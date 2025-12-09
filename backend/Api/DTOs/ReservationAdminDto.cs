using Api.DTOs;

public class ReservationAdminDto
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public string TableName { get; set; } // nombre de la mesa
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int Guests { get; set; }
    public string Status { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string UserEmail { get; set; } // email del usuario
    public List<ReservationDishDto> Dishes { get; set; }
    public string Notes { get; set; }
}