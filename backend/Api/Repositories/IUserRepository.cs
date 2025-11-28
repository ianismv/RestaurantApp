using Api.Models;
using System.Threading.Tasks;

namespace Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task CreateAsync(User user);
}