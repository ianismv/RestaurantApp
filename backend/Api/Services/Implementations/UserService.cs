using Api.DTOs;
using Api.Models.Entities;
using Api.Repositories.Interfaces;
using Api.Services.Interfaces;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Api.Services.Implementations;

/// <summary>
/// Servicio de usuarios: registro, login, tokens y consultas.
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IConfiguration _config;

    public UserService(IUserRepository userRepository, IMapper mapper, IConfiguration config)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _config = config;
    }

    // ===========================================================================
    // REGISTER
    // ===========================================================================
    public async Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto)
    {
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new Exception("Email already registered");

        var user = _mapper.Map<User>(dto);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _userRepository.CreateAsync(user);

        // NOTE: BuildAuthResponseAsync persiste el refresh token
        return await BuildAuthResponseAsync(user);
    }

    // ===========================================================================
    // LOGIN
    // ===========================================================================
    public async Task<AuthResponseDto> LoginAsync(UserLoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new Exception("Invalid credentials");

        // Actualizar LastLoginAt opcional
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Genera y persiste refresh token
        return await BuildAuthResponseAsync(user);
    }

    // ===========================================================================
    // CONSULTAS
    // ===========================================================================
    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    // ===========================================================================
    // REFRESH TOKEN REVOKE (sin DbContext)
    // ===========================================================================
    public async Task RevokeRefreshTokenAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            throw new Exception("User not found");

        user.RefreshToken = null;
        user.RefreshTokenExpiration = null;

        await _userRepository.UpdateAsync(user);
    }

    // ===========================================================================
    // HELPERS
    // ===========================================================================
    private async Task<AuthResponseDto> BuildAuthResponseAsync(User user)
    {
        // Generar access token
        var accessToken = GenerateJwtToken(user);

        // Generar refresh token y expiración (ej.: 7 días)
        var refreshToken = Guid.NewGuid().ToString();
        var refreshExpires = DateTime.UtcNow.AddDays(7);

        // Persistir refresh token en la entidad y en la DB mediante repositorio
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiration = refreshExpires;

        // Actualizar usuario en DB de forma asíncrona
        await _userRepository.UpdateAsync(user);

        // Construir respuesta
        return new AuthResponseDto
        {
            User = _mapper.Map<UserDto>(user),
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role ?? "User")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _config["JWT_SECRET"] ?? throw new InvalidOperationException("JWT_SECRET not configured")
            )
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            issuer: _config["JWT_ISSUER"] ?? "api",
            audience: _config["JWT_AUDIENCE"] ?? "frontend",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);

        if (user == null ||
            user.RefreshTokenExpiration == null ||
            user.RefreshTokenExpiration < DateTime.UtcNow)
            throw new Exception("Invalid or expired refresh token");

        var newAccessToken = GenerateJwtToken(user);

        var newRefreshToken = Guid.NewGuid().ToString();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiration = DateTime.UtcNow.AddDays(7);

        await _userRepository.UpdateAsync(user);

        return new AuthResponseDto
        {
            User = _mapper.Map<UserDto>(user),
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }
}
