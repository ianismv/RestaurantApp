using Api.DTOs;
using System.Threading.Tasks;

namespace Api.Services.Interfaces;

public interface IUserService
{
    Task<string> RegisterAsync(UserRegisterDto dto);
    Task<string> LoginAsync(UserLoginDto dto);
}