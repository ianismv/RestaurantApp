namespace Api.Models
{
    public class Dish { 
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        // Relación muchos-a-muchos con Reservation
        public List<ReservationDish> ReservationDishes { get; set; } = new();
    }
}
