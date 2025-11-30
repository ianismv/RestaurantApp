using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

/// <summary>
/// DTO used for user login requests.
/// Contains only the required credentials.
/// </summary>
public class UserLoginDto
{
    [Required(ErrorMessage = "Se requiere email.")]
    [EmailAddress(ErrorMessage = "Formato de email inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Se requiere contraseña.")]
    public string Password { get; set; } = string.Empty;
}
