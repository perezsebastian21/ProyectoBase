using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.UsuarioService;
using System.Threading.Tasks;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Policy = "ADMINISTRADOR")]
    public class RolController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public RolController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        /// <summary>
        /// Obtiene el catálogo completo de roles disponibles en el sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _usuarioService.ObtenerTodosLosRolesAsync();
            return Ok(new ServiceResponse<object>(roles));
        }
    }
}
