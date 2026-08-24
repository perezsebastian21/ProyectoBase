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
            [FromQuery] string fechaDesde = null,
            [FromQuery] string fechaHasta = null,
            [FromQuery] int? idUnidadHabitacional = null)
        {
            string fechaValInicio = !string.IsNullOrWhiteSpace(fechaDesde) ? fechaDesde : fecha;
            DateOnly inicio = string.IsNullOrEmpty(fechaValInicio)
                ? DateOnly.FromDateTime(DateTime.Today)
                : DateOnly.Parse(fechaValInicio);

            DateOnly? fin = !string.IsNullOrWhiteSpace(fechaHasta)
                ? DateOnly.Parse(fechaHasta)
                : null;

            var resultado = await _disponibilidadService.ConsultarDisponibilidadAsync(id, inicio, fin, idUnidadHabitacional);
            return Ok(new ServiceResponse<DisponibilidadResponseDto>(resultado));
        }
    }
}
