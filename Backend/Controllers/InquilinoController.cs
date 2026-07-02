using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InquilinoController : GenericControllerAsync<Inquilino>
    {
        public InquilinoController(IServiceAsync<Inquilino> service) : base(service)
        {
        }
    }
}
