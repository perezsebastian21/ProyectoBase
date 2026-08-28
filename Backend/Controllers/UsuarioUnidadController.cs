using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.DTOs.UsuarioUnidad;
using ProyectoBase.Models;
using ProyectoBase.Services.UsuarioUnidadService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using System.Security.Claims;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("api/usuario-unidad")]
    [Route("api/usuario-unidades")]
    [Route("usuario-unidad")]
    [Route("usuario-unidades")]
    [Route("UsuarioUnidad")]
    [Route("UsuarioUnidades")]
    [Route("api/unidades")]
    [Route("unidades")]
    public class UsuarioUnidadController : ControllerBase
    {
        private readonly IUsuarioUnidadService _usuarioUnidadService;

        public UsuarioUnidadController(IUsuarioUnidadService usuarioUnidadService)
        {
            _usuarioUnidadService = usuarioUnidadService;
        }

        private int GetCurrentUserId()
        {
            var claim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User?.FindFirst("id")?.Value
                     ?? User?.FindFirst("sub")?.Value;

            if (int.TryParse(claim, out int userId))
                return userId;
            return 0;
        }

        /// <summary>
        /// Obtiene las unidades habitacionales vinculadas al usuario actualmente autenticado.
        /// </summary>
        [HttpGet("mis-unidades")]
        [HttpGet("me")]
        [HttpGet("mis-propiedades")]
        [Authorize]
        public async Task<IActionResult> GetMisUnidades()
        {
            int userId = GetCurrentUserId();
            if (userId <= 0)
                return Unauthorized(new ServiceResponse<object>("No se pudo identificar al usuario autenticado."));

            var misUnidades = await _usuarioUnidadService.ObtenerMisUnidadesAsync(userId);
            return Ok(new ServiceResponse<object>(misUnidades));
        }

        /// <summary>
        /// Obtiene las solicitudes de vinculación pendientes de aprobación por el Administrador.
        /// </summary>
        [HttpGet("pendientes")]
        [Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
        public async Task<IActionResult> GetPendientes([FromQuery] int? idConsorcio)
        {
            var pendientes = await _usuarioUnidadService.ObtenerPendientesAsync(idConsorcio);
            return Ok(new ServiceResponse<object>(pendientes));
        }

        /// <summary>
        /// Aprueba la vinculación de un propietario a una unidad habitacional.
        /// </summary>
        [HttpPost("{id}/aprobar")]
        [Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
        public async Task<IActionResult> Aprobar(int id)
        {
            try
            {
                var uu = await _usuarioUnidadService.AprobarUsuarioUnidadAsync(id);
                return Ok(new ServiceResponse<object>(uu));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ServiceResponse<object>(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }

        /// <summary>
        /// Rechaza la solicitud de vinculación de un propietario.
        /// </summary>
        [HttpPost("{id}/rechazar")]
        [Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
        public async Task<IActionResult> Rechazar(int id, [FromBody] RechazarUsuarioUnidadDto dto)
        {
            try
            {
                var uu = await _usuarioUnidadService.RechazarUsuarioUnidadAsync(id, dto?.MotivoRechazo);
                return Ok(new ServiceResponse<object>(uu));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ServiceResponse<object>(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }
    }
}
