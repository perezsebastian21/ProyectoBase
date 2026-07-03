using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ListaEsperaController : GenericControllerAsync<ListaEspera>
    {
        public ListaEsperaController(IServiceAsync<ListaEspera> service) : base(service)
        {
        }
    }
}
