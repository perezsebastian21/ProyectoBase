using Microsoft.AspNetCore.Mvc;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet("alive")]
        public IActionResult Alive()
        {
            return Ok(new
            {
                status = "ok",
                service = "ProyectoBase Backend",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
        }
    }
}
