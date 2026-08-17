using Microsoft.EntityFrameworkCore;
using ProyectoBase.Models;
using System.Threading.Tasks;

namespace ProyectoBase.Services.UsuarioService
{
    public class UsuarioService : IUsuarioService
    {
        private readonly ApplicationDbContext _context;

        public UsuarioService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <inheritdoc />
        public async Task<Usuario> ValidarCredenciales(string username, string password)
        {
            return await _context.Usuarios
                .Include(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u =>
                    u.Username == username &&
                    u.Password == password &&
                    u.Activo);
        }

        /// <inheritdoc />
        public async Task<System.Collections.Generic.IEnumerable<Rol>> ObtenerTodosLosRolesAsync()
        {
            return await _context.Roles.ToListAsync();
        }

        /// <inheritdoc />
        public async Task<System.Collections.Generic.IEnumerable<Rol>> ObtenerRolesUsuarioAsync(int idUsuario)
        {
            var roles = await _context.UsuariosRoles
                .Where(ur => ur.IDUsuario == idUsuario)
                .Include(ur => ur.Rol)
                .Select(ur => ur.Rol)
                .ToListAsync();

            return roles;
        }

        /// <inheritdoc />
        public async Task<UsuarioRol> AsignarRolAUsuarioAsync(int idUsuario, int idRol)
        {
            var usuario = await _context.Usuarios.FindAsync(idUsuario);
            if (usuario == null)
                throw new KeyNotFoundException($"El usuario con ID {idUsuario} no existe.");

            var rol = await _context.Roles.FindAsync(idRol);
            if (rol == null)
                throw new KeyNotFoundException($"El rol con ID {idRol} no existe.");

            var existe = await _context.UsuariosRoles
                .AnyAsync(ur => ur.IDUsuario == idUsuario && ur.IDRol == idRol);

            if (existe)
                throw new InvalidOperationException("El usuario ya posee el rol especificado.");

            var usuarioRol = new UsuarioRol
            {
                IDUsuario = idUsuario,
                IDRol = idRol
            };

            _context.UsuariosRoles.Add(usuarioRol);
            await _context.SaveChangesAsync();

            usuarioRol.Rol = rol;
            return usuarioRol;
        }

        /// <inheritdoc />
        public async Task<bool> RemoverRolDeUsuarioAsync(int idUsuario, int idRol)
        {
            var usuarioRol = await _context.UsuariosRoles
                .FirstOrDefaultAsync(ur => ur.IDUsuario == idUsuario && ur.IDRol == idRol);

            if (usuarioRol == null)
                return false;

            _context.UsuariosRoles.Remove(usuarioRol);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
