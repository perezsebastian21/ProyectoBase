using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
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
        public async Task<ActionResult<ServiceResponse<DisponibilidadResponseDto>>> GetDisponibilidad(int id, [FromQuery] string fecha)
        {
            DateOnly fechaConsulta = string.IsNullOrEmpty(fecha)
                ? DateOnly.FromDateTime(DateTime.Today)
                : DateOnly.Parse(fecha);

            var resultado = await _disponibilidadService.ConsultarDisponibilidadAsync(id, fechaConsulta);
            return Ok(new ServiceResponse<DisponibilidadResponseDto>(resultado));
        }
    }
}
