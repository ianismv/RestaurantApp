using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

/// <summary>
/// Representa los datos seguros y públicos de un usuario
/// que pueden ser enviados al frontend.
/// Nunca expone información sensible (password, hashes, tokens).
/// </summary>
public class UserDto
{
    /// <summary>
    /// Identificador único del usuario.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Email del usuario. Campo único.
    /// </summary>
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Nombre visible del usuario.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Rol del usuario dentro del sistema.
    /// </summary>
    public string Role { get; set; } = "User";
}
