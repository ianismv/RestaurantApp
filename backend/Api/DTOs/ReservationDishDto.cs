namespace Api.DTOs
{
    public class ReservationDishDto
    {
        public int DishId { get; set; }
        public string DishName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // <- agregar

        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateReservationDishDto
    {
        public int DishId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateReservationDishDto
    {
        public int Quantity { get; set; }
    }
}
