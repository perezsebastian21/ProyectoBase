using ProyectoBase.DTOs.Invitacion;
using ProyectoBase.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectoBase.Services.InvitacionService
{
    public interface IInvitacionService
    {
        Task<InvitacionUsuario> CrearInvitacionAdminAsync(CrearInvitacionAdminDto dto, int idUsuarioCreador);
        Task<IEnumerable<InvitacionUsuario>> CrearInvitacionesMasivasAsync(CrearInvitacionesMasivasDto dto, int idUsuarioCreador);
        Task<InvitacionUsuario> CrearInvitacionInquilinoAsync(CrearInvitacionInquilinoDto dto, int idUsuarioCreador);
        Task<ValidarTokenResponseDto> ValidarTokenAsync(string token);
        Task<Usuario> AceptarInvitacionAsync(AceptarInvitacionRequestDto dto);
    }
}
