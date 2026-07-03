using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuditLogController : GenericControllerAsync<AuditLog>
    {
        public AuditLogController(IServiceAsync<AuditLog> service) : base(service)
        {
        }
    }
}
