using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;
using ProyectoBase.Services.UsuarioService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsuarioController : GenericControllerAsync<Usuario>
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IServiceAsync<Usuario> service, IUsuarioService usuarioService) : base(service)
        {
            _usuarioService = usuarioService;
        }

        /// <summary>
        /// Obtiene los roles asignados a un usuario específico.
        /// </summary>
        [HttpGet("{idUsuario}/Roles")]
        [Authorize(Policy = "ADMINISTRADOR")]
        public async Task<IActionResult> GetRolesUsuario(int idUsuario)
        {
            var roles = await _usuarioService.ObtenerRolesUsuarioAsync(idUsuario);
            return Ok(new ServiceResponse<object>(roles));
        }

        /// <summary>
        /// Asigna un rol a un usuario determinado.
        /// </summary>
        [HttpPost("{idUsuario}/Roles")]
        [Authorize(Roles = "SUPER_ADMINISTRADOR,ADMINISTRADOR_AVANZADO")]
        public async Task<IActionResult> AsignarRol(int idUsuario, [FromBody] AsignarRolRequest request)
        {
            if (request == null || request.IDRol <= 0)
                return BadRequest(new ServiceResponse<object>("Debe especificar un IDRol válido."));

            try
            {
                var resultado = await _usuarioService.AsignarRolAUsuarioAsync(idUsuario, request.IDRol);
                return Ok(new ServiceResponse<object>(new
                {
                    idUsuarioRol = resultado.IDUsuarioRol,
                    idUsuario = resultado.IDUsuario,
                    idRol = resultado.IDRol,
                    codigoRol = resultado.Rol?.Codigo,
                    nombreRol = resultado.Rol?.Nombre
                }));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ServiceResponse<object>(ex.Message));
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }

        /// <summary>
        /// Remueve la asignación de un rol de un usuario.
        /// </summary>
        [HttpDelete("{idUsuario}/Roles/{idRol}")]
        [Authorize(Roles = "SUPER_ADMINISTRADOR,ADMINISTRADOR_AVANZADO")]
        public async Task<IActionResult> RemoverRol(int idUsuario, int idRol)
        {
            var removido = await _usuarioService.RemoverRolDeUsuarioAsync(idUsuario, idRol);
            if (!removido)
                return NotFound(new ServiceResponse<object>("La asignación de rol especificada no existe para este usuario."));

            return Ok(new ServiceResponse<object>(true));
        }
    }
}
