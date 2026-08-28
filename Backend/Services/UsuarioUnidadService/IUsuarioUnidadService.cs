using ProyectoBase.DTOs.UsuarioUnidad;
using ProyectoBase.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectoBase.Services.UsuarioUnidadService
{
    public interface IUsuarioUnidadService
    {
        Task<IEnumerable<UsuarioUnidadPendienteDto>> ObtenerPendientesAsync(int? idConsorcio);
        Task<IEnumerable<MiUnidadDto>> ObtenerMisUnidadesAsync(int idUsuario);
        Task<UsuarioUnidad> AprobarUsuarioUnidadAsync(int idUsuarioUnidad);
        Task<UsuarioUnidad> RechazarUsuarioUnidadAsync(int idUsuarioUnidad, string motivoRechazo);
    }
}
