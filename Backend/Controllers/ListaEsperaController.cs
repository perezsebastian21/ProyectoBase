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
    public class ListaEsperaController : GenericControllerAsync<ListaEspera>
    {
        private readonly ApplicationDbContext _context;

        public ListaEsperaController(IServiceAsync<ListaEspera> service, ApplicationDbContext context) : base(service)
        {
            _context = context;
        }

        [HttpDelete("{id:int}/RetiroVoluntario")]
        public async Task<ActionResult<ServiceResponse<ListaEspera>>> RetiroVoluntario(int id)
        {
            var item = await _context.ListasEspera.FindAsync(id);
            if (item == null)
            {
                throw new NotFoundException($"No se encontró la inscripción en lista de espera con ID {id}.");
            }

            if (item.Estado == "EXPIRADO" || item.Estado == "CONFIRMADO")
            {
                throw new BadRequestException($"No se puede retirar voluntariamente una inscripción en estado {item.Estado}.");
            }

            item.Estado = "EXPIRADO";
            item.FechaResolucion = DateTime.UtcNow;
            item.MotivoExpiracion = "CANCELO";

            await _context.SaveChangesAsync();

            return Ok(new ServiceResponse<ListaEspera>(item));
        }
    }
}
