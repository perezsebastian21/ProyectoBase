using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AmenityConfigController : GenericControllerAsync<AmenityConfig>
    {
        public AmenityConfigController(IServiceAsync<AmenityConfig> service) : base(service)
        {
        }
    }
}
