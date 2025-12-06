using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class CreateDishDto
{
    [Required(ErrorMessage = "Dish name is required")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Dish price is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be positive")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Dish category is required")]
    public string Category { get; set; } = string.Empty;
}
