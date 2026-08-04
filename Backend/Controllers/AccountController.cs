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

            string token = _tokenService.GenerateUserToken(usuario);

            var roles = new System.Collections.Generic.List<string>();

            if (usuario.UsuarioRoles != null && usuario.UsuarioRoles.Count > 0)
            {
                foreach (var ur in usuario.UsuarioRoles)
                {
                    var codigo = ur.Rol?.Codigo;
                    if (!string.IsNullOrWhiteSpace(codigo) && !roles.Contains(codigo))
                    {
                        roles.Add(codigo);
                    }
                }
            }

            if (roles.Count == 0 && !string.IsNullOrWhiteSpace(usuario.Rol))
            {
                roles.Add(usuario.Rol);
            }

            if (roles.Count == 0)
            {
                roles.Add("INQUILINO");
            }

            return Ok(new ServiceResponse<object>(new
            {
                token = token,
                expiration = DateTime.UtcNow.AddHours(1),
                username = usuario.Username,
                roles = roles
            }));
        }
    }
}
