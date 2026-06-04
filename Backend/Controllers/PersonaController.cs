using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PersonaController : GenericControllerAsync<Persona>
    {
        public PersonaController(IServiceAsync<Persona> service) : base(service)
        {
        }

        // Si en el futuro surgieran endpoints muy específicos para Persona,
        // se declararían aquí. Todo el CRUD y la búsqueda paginada base ya se
        // heredan del GenericControllerAsync<Persona>.
    }
}
