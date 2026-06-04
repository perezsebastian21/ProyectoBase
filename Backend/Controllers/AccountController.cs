using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.TokenService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ITokenService _tokenService;

        public AccountController(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }

        /// <summary>
        /// Genera un JWT para el usuario indicado.
        /// Por el momento no valida credenciales contra la base de datos.
        /// TODO: implementar validación real (DB / LDAP) cuando corresponda.
        /// </summary>
        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            string token = _tokenService.GenerateAdminToken(request.Usuario);

            return Ok(new ServiceResponse<object>(new
            {
                token,
                expiration = DateTime.UtcNow.AddHours(1)
            }));
        }
    }
}
