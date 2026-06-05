using ProyectoBase.Models;
using System.Threading.Tasks;

namespace ProyectoBase.Services.UsuarioService
{
    public interface IUsuarioService
    {
        /// <summary>
        /// Busca un usuario activo por Username y Password para autenticación.
        /// Retorna el Usuario si las credenciales son válidas, null si no.
        /// </summary>
        Task<Usuario> ValidarCredenciales(string username, string password);
    }
}
