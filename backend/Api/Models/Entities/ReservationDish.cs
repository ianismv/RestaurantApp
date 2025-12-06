using Api.Models.Entities;

namespace Api.Models
{
    public class ReservationDish
    {
        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; } = null!;

        public int DishId { get; set; }
        public Dish Dish { get; set; } = null!;

        public int Quantity { get; set; } = 1;
    }
}
