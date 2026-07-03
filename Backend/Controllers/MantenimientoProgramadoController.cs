using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MantenimientoProgramadoController : GenericControllerAsync<MantenimientoProgramado>
    {
        public MantenimientoProgramadoController(IServiceAsync<MantenimientoProgramado> service) : base(service)
        {
        }
    }
}
