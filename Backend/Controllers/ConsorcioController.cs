using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ConsorcioController : GenericControllerAsync<Consorcio>
    {
        public ConsorcioController(IServiceAsync<Consorcio> service) : base(service)
        {
        }
    }
}
