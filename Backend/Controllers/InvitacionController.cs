using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.DTOs.Invitacion;
using ProyectoBase.Models;
using ProyectoBase.Services.InvitacionService;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("api/invitaciones")]
    public class InvitacionController : ControllerBase
    {
        private readonly IInvitacionService _invitacionService;

        public InvitacionController(IInvitacionService invitacionService)
        {
            _invitacionService = invitacionService;
        }

        private int GetCurrentUserId()
        {
            var claim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out int userId))
                return userId;
            return 0;
        }

        /// <summary>
        /// Crea una invitación para un Administrador Avanzado (Exclusivo SuperAdmin).
        /// </summary>
        [HttpPost("crear-admin")]
        [Authorize(Roles = "SUPER_ADMINISTRADOR")]
        public async Task<IActionResult> CrearAdmin([FromBody] CrearInvitacionAdminDto dto)
        {
            try
            {
                var inv = await _invitacionService.CrearInvitacionAdminAsync(dto, GetCurrentUserId());
                return Ok(new ServiceResponse<object>(inv));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }

        /// <summary>
        /// Crea invitaciones masivas para propietarios de un consorcio/edificio.
        /// </summary>
        [HttpPost("masivas")]
        [Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
        public async Task<IActionResult> CrearMasivas([FromBody] CrearInvitacionesMasivasDto dto)
        {
            try
            {
                var invs = await _invitacionService.CrearInvitacionesMasivasAsync(dto, GetCurrentUserId());
                return Ok(new ServiceResponse<object>(invs));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }

        /// <summary>
        /// Permite a un propietario invitar a un inquilino a su unidad habitacional.
        /// </summary>
        [HttpPost("inquilino")]
        [Authorize(Roles = "PROPIETARIO")]
        public async Task<IActionResult> CrearInquilino([FromBody] CrearInvitacionInquilinoDto dto)
        {
            try
            {
                var inv = await _invitacionService.CrearInvitacionInquilinoAsync(dto, GetCurrentUserId());
                return Ok(new ServiceResponse<object>(inv));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ServiceResponse<object>(ex.Message));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }

        /// <summary>
        /// Valida el token de invitación (Público).
        /// </summary>
        [HttpGet("validar/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidarToken(string token)
        {
            var res = await _invitacionService.ValidarTokenAsync(token);
            if (!res.Valido)
                return BadRequest(new ServiceResponse<object>(res.Mensaje));

            return Ok(new ServiceResponse<object>(res));
        }

        /// <summary>
        /// Acepta la invitación y registra/vincula al usuario (Público).
        /// </summary>
        [HttpPost("aceptar")]
        [AllowAnonymous]
        public async Task<IActionResult> AceptarInvitacion([FromBody] AceptarInvitacionRequestDto dto)
        {
            try
            {
                var usuario = await _invitacionService.AceptarInvitacionAsync(dto);
                return Ok(new ServiceResponse<object>(new
                {
                    idUsuario = usuario.IDUsuario,
                    username = usuario.Username,
                    email = usuario.Email,
                    rol = usuario.Rol
                }));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ServiceResponse<object>(ex.Message));
            }
        }
    }
}
