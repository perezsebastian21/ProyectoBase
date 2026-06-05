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
                .FirstOrDefaultAsync(u =>
                    u.Username == username &&
                    u.Password == password &&
                    u.Activo);
        }
    }
}
