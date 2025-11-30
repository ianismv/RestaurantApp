using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

/// <summary>
/// DTO used for user registration.
/// Includes required user details and password validation.
/// </summary>
public class UserRegisterDto
{
    [Required(ErrorMessage = "Se requiere email.")]
    [EmailAddress(ErrorMessage = "Formato de email inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Se requiere contraseña.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener, al menos, 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Se requiere el nombre.")]
    public string Name { get; set; } = string.Empty;
}
