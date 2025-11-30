using Api.Models.Entities;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);

    Task CreateAsync(User user);

    // NUEVO
    Task UpdateAsync(User user);
}
