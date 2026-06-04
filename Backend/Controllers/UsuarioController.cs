using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsuarioController : GenericControllerAsync<Usuario>
    {
        public UsuarioController(IServiceAsync<Usuario> service) : base(service)
        {
        }

        // Si en el futuro surgieran endpoints muy específicos para Usuario,
        // se declararían aquí. Todo el CRUD y la búsqueda paginada base ya se
        // heredan del GenericControllerAsync<Usuario>.
    }
}
