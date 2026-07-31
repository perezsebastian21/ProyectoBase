using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;
using ProyectoBase.Models.DTOs;
using ProyectoBase.Services;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReservaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ReservaService _reservaService;
        private readonly IServiceAsync<Reserva> _genericService;

        public ReservaController(
            IServiceAsync<Reserva> genericService,
            ApplicationDbContext context,
            ReservaService reservaService)
        {
            _genericService = genericService;
            _context = context;
            _reservaService = reservaService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<ServiceResponse<System.Collections.Generic.IEnumerable<Reserva>>>> GetAll()
        {
            var items = await _genericService.GetAll();
            return Ok(new ServiceResponse<System.Collections.Generic.IEnumerable<Reserva>>(items));
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ServiceResponse<Reserva>>> GetById(int id)
        {
            var item = await _genericService.GetByID(id);
            return Ok(new ServiceResponse<Reserva>(item));
        }

        [HttpGet("FindQP")]
        public async Task<ActionResult<ServiceResponse<PagedResponse<Reserva>>>> FindQP([FromQuery] QueryParams qp)
        {
            var items = await _genericService.FindBy(qp);
            var total = _genericService.Count(qp);

            var pagedResponse = new PagedResponse<Reserva>(
                (System.Collections.Generic.List<Reserva>)items,
                qp.page ?? 1,
                qp.limit ?? 10,
                total
            );

            return Ok(new ServiceResponse<PagedResponse<Reserva>>(pagedResponse));
        }

        [HttpPost]
        public async Task<ActionResult<ServiceResponse<ReservaResponseDto>>> CrearReserva([FromBody] ReservaRequestDto dto)
        {
            var resultado = await _reservaService.CrearReservaAsync(dto);
            return Ok(new ServiceResponse<ReservaResponseDto>(resultado));
        }

        [HttpPut]
        public async Task<ActionResult<ServiceResponse<Reserva>>> Update([FromBody] Reserva entity)
        {
            var updatedItem = await _genericService.Update(entity);
            return Ok(new ServiceResponse<Reserva>(updatedItem));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<object>>> Delete(int id)
        {
            await _genericService.Delete(id);
            return Ok(new ServiceResponse<object>(data: null));
        }

        [HttpPost("{id:int}/CheckIn")]
        public async Task<ActionResult<ServiceResponse<Reserva>>> CheckIn(int id)
        {
            var reserva = await _context.Reservas.FindAsync(id);
            if (reserva == null)
            {
                throw new NotFoundException($"No se encontró la reserva con ID {id}.");
            }

            if (reserva.Estado != "CONFIRMADA" && reserva.Estado != "Confirmed")
            {
                throw new BadRequestException($"Solo se puede realizar Check-In sobre reservas en estado CONFIRMADA (Estado actual: {reserva.Estado}).");
            }

            reserva.CheckInRealizado = true;
            reserva.CheckInFecha = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ServiceResponse<Reserva>(reserva));
        }
    }
}
