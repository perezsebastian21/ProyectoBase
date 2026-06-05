using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.TokenService;
using ProyectoBase.Services.UsuarioService;
using System;
using System.Threading.Tasks;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IUsuarioService _usuarioService;

        public AccountController(ITokenService tokenService, IUsuarioService usuarioService)
        {
            _tokenService = tokenService;
            _usuarioService = usuarioService;
        }

        /// <summary>
        /// Valida las credenciales del usuario contra la base de datos y,
        /// si son correctas, devuelve un JWT de acceso.
        /// </summary>
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _usuarioService.ValidarCredenciales(request.Usuario, request.Password);

            if (usuario == null)
                return Unauthorized(new { message = "Usuario o contraseña incorrectos." });

            string token = _tokenService.GenerateAdminToken(usuario.Username);

            return Ok(new ServiceResponse<object>(new
            {
                token = token,
                expiration = DateTime.UtcNow.AddHours(1),
                username = usuario.Username
            }));
        }
    }
}
