using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UnidadHabitacionalController : GenericControllerAsync<UnidadHabitacional>
    {
        public UnidadHabitacionalController(IServiceAsync<UnidadHabitacional> service) : base(service)
        {
        }
    }
}
