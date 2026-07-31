using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;
using ProyectoBase.Services;

namespace ProyectoBase.Controllers
{
    [ApiController]
    [Route("api/Amenity")]
    public class CancelacionMasivaController : ControllerBase
    {
        private readonly CancelacionMasivaService _cancelacionService;

        public CancelacionMasivaController(CancelacionMasivaService cancelacionService)
        {
            _cancelacionService = cancelacionService;
        }

        [HttpPost("{id:int}/FueraDeServicio")]
        public async Task<ActionResult<ServiceResponse<CancelacionMasivaResultDto>>> DeclararFueraDeServicio(int id, [FromBody] CancelacionMasivaRequestDto dto)
        {
            if (dto == null)
            {
                throw new BadRequestException("El cuerpo de la solicitud no puede estar vacío.");
            }

            dto.IDAmenity = id;

            if (string.IsNullOrWhiteSpace(dto.MotivoAdmin))
            {
                throw new BadRequestException("Debe proporcionar un motivo administrativo (MotivoAdmin).");
            }

            var resultado = await _cancelacionService.EjecutarCancelacionMasivaAsync(dto);
            return Ok(new ServiceResponse<CancelacionMasivaResultDto>(resultado));
        }
    }
}
