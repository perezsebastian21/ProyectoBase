using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InvitadoController : GenericControllerAsync<Invitado>
    {
        public InvitadoController(IServiceAsync<Invitado> service) : base(service)
        {
        }
    }
}
