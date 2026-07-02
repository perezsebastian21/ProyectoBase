using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AmenityController : GenericControllerAsync<Amenity>
    {
        public AmenityController(IServiceAsync<Amenity> service) : base(service)
        {
        }
    }
}
