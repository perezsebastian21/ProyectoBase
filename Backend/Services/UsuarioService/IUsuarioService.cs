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

        /// <summary>
        /// Obtiene el catálogo completo de roles disponibles en el sistema.
        /// </summary>
        Task<System.Collections.Generic.IEnumerable<Rol>> ObtenerTodosLosRolesAsync();

        /// <summary>
        /// Obtiene la lista de roles asignados a un usuario específico.
        /// </summary>
        Task<System.Collections.Generic.IEnumerable<Rol>> ObtenerRolesUsuarioAsync(int idUsuario);

        /// <summary>
        /// Asigna un rol a un usuario si no lo posee previamente.
        /// </summary>
        Task<UsuarioRol> AsignarRolAUsuarioAsync(int idUsuario, int idRol);

        /// <summary>
        /// Remueve la asignación de un rol de un usuario.
        /// </summary>
        Task<bool> RemoverRolDeUsuarioAsync(int idUsuario, int idRol);
    }
}
