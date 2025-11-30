namespace Api.DTOs;

/// <summary>
/// Standard authentication response that includes user public data
/// and tokens required for session handling.
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Public user data (never exposes password hash).
    /// </summary>
    public UserDto User { get; set; } = default!;

    /// <summary>
    /// Short-lived access token (JWT).
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Long-lived refresh token.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
    public record RefreshRequestDto(string RefreshToken);

}
