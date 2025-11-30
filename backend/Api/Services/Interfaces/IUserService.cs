using Api.DTOs;

namespace Api.Services.Interfaces;

public interface IUserService
{
    Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto);
    Task<AuthResponseDto> LoginAsync(UserLoginDto dto);
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> GetByEmailAsync(string email);
    Task RevokeRefreshTokenAsync(int userId);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);

}
