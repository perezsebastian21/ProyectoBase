using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReservaController : GenericControllerAsync<Reserva>
    {
        public ReservaController(IServiceAsync<Reserva> service) : base(service)
        {
        }
    }
}
