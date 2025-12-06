namespace Api.DTOs
{
    public class ReservationDishDto
    {
        public int DishId { get; set; }
        public string DishName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateReservationDishDto
    {
        public int DishId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
