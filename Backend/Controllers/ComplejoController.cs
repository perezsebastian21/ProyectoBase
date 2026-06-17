using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ComplejoController : GenericControllerAsync<Complejo>
    {
        public ComplejoController(IServiceAsync<Complejo> service) : base(service)
        {
        }
    }
}
