using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class IncidenciaController : GenericControllerAsync<Incidencia>
    {
        public IncidenciaController(IServiceAsync<Incidencia> service) : base(service)
        {
        }
    }
}
