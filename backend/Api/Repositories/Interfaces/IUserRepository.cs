using Api.Models.Entities;
using Api.Models.Enums;
using System.Threading.Tasks;

namespace Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task CreateAsync(User user);
}