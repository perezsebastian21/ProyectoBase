using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReservaController : GenericControllerAsync<Reserva>
    {
        private readonly ApplicationDbContext _context;

        public ReservaController(IServiceAsync<Reserva> service, ApplicationDbContext context) : base(service)
        {
            _context = context;
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
