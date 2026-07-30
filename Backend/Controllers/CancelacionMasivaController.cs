using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Services;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("api/Amenity")]
    public class CancelacionMasivaController : ControllerBase
    {
        private readonly CancelacionMasivaService _cancelacionService;

        public CancelacionMasivaController(CancelacionMasivaService cancelacionService)
        {
            _cancelacionService = cancelacionService;
        }

        [HttpPost("{id:int}/FueraDeServicio")]
        public async Task<IActionResult> DeclararFueraDeServicio(int id, [FromBody] CancelacionMasivaRequestDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { mensaje = "El cuerpo de la solicitud no puede estar vacío." });
            }

            dto.IDAmenity = id;

            if (string.IsNullOrWhiteSpace(dto.MotivoAdmin))
            {
                return BadRequest(new { mensaje = "Debe proporcionar un motivo administrativo (MotivoAdmin)." });
            }

            try
            {
                var resultado = await _cancelacionService.EjecutarCancelacionMasivaAsync(dto);
                return Ok(resultado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al ejecutar la cancelación masiva.", detalle = ex.Message });
            }
        }
    }
}
