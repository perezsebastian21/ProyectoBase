using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("Amenity")]
    public class DisponibilidadController : ControllerBase
    {
        private readonly DisponibilidadService _disponibilidadService;

        public DisponibilidadController(DisponibilidadService disponibilidadService)
        {
            _disponibilidadService = disponibilidadService;
        }

        [HttpGet("{id:int}/Disponibilidad")]
        public async Task<ActionResult<ServiceResponse<DisponibilidadResponseDto>>> GetDisponibilidad(
            int id,
            [FromQuery] string fecha = null,
            [FromQuery] string fechaDesde = null)
        {
            string fechaVal = !string.IsNullOrWhiteSpace(fecha) ? fecha : fechaDesde;
            DateOnly fechaConsulta = string.IsNullOrEmpty(fechaVal)
                ? DateOnly.FromDateTime(DateTime.Today)
                : DateOnly.Parse(fechaVal);

            var resultado = await _disponibilidadService.ConsultarDisponibilidadAsync(id, fechaConsulta);
            return Ok(new ServiceResponse<DisponibilidadResponseDto>(resultado));
        }
    }
}
