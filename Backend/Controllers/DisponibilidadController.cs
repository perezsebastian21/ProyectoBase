using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Services;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("api/Amenity")]
    public class DisponibilidadController : ControllerBase
    {
        private readonly DisponibilidadService _disponibilidadService;

        public DisponibilidadController(DisponibilidadService disponibilidadService)
        {
            _disponibilidadService = disponibilidadService;
        }

        [HttpGet("{id:int}/Disponibilidad")]
        public async Task<IActionResult> GetDisponibilidad(int id, [FromQuery] string? fecha)
        {
            try
            {
                DateOnly fechaConsulta = string.IsNullOrEmpty(fecha)
                    ? DateOnly.FromDateTime(DateTime.Today)
                    : DateOnly.Parse(fecha);

                var resultado = await _disponibilidadService.ConsultarDisponibilidadAsync(id, fechaConsulta);
                return Ok(resultado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (FormatException)
            {
                return BadRequest(new { mensaje = "Formato de fecha inválido. Utilice YYYY-MM-DD." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al consultar disponibilidad.", detalle = ex.Message });
            }
        }
    }
}
