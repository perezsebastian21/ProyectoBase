using Microsoft.EntityFrameworkCore;
using ProyectoBase.DTOs.Invitacion;
using ProyectoBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProyectoBase.Services.InvitacionService
{
    public class InvitacionService : IInvitacionService
    {
        private readonly ApplicationDbContext _context;

        public InvitacionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<InvitacionUsuario> CrearInvitacionAdminAsync(CrearInvitacionAdminDto dto, int idUsuarioCreador)
        {
            if (string.IsNullOrWhiteSpace(dto.EmailDestino))
                throw new ArgumentException("El email de destino es obligatorio.");

            var invitacion = new InvitacionUsuario
            {
                EmailDestino = dto.EmailDestino.Trim().ToLower(),
                Token = Guid.NewGuid().ToString("N"),
                RolDestino = "ADMINISTRADOR_AVANZADO",
                Estado = "PENDIENTE",
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = DateTime.UtcNow.AddDays(7),
                IDUsuarioCreador = idUsuarioCreador > 0 ? idUsuarioCreador : null
            };

            _context.InvitacionesUsuarios.Add(invitacion);
            await _context.SaveChangesAsync();
            return invitacion;
        }

        public async Task<IEnumerable<InvitacionUsuario>> CrearInvitacionesMasivasAsync(CrearInvitacionesMasivasDto dto, int idUsuarioCreador)
        {
            if (dto.IDConsorcio <= 0)
                throw new ArgumentException("Debe indicar el ID del consorcio.");

            if (dto.Invitaciones == null || dto.Invitaciones.Count == 0)
                throw new ArgumentException("Debe enviar al menos una invitación.");

            var creadas = new List<InvitacionUsuario>();

            foreach (var item in dto.Invitaciones)
            {
                if (string.IsNullOrWhiteSpace(item.EmailDestino))
                    continue;

                var inv = new InvitacionUsuario
                {
                    IDConsorcio = dto.IDConsorcio,
                    IDComplejo = dto.IDComplejo,
                    IDUnidadHabitacional = item.IDUnidadHabitacional,
                    EmailDestino = item.EmailDestino.Trim().ToLower(),
                    Token = Guid.NewGuid().ToString("N"),
                    RolDestino = "PROPIETARIO",
                    Estado = "PENDIENTE",
                    FechaCreacion = DateTime.UtcNow,
                    FechaExpiracion = DateTime.UtcNow.AddDays(7),
                    IDUsuarioCreador = idUsuarioCreador > 0 ? idUsuarioCreador : null
                };

                _context.InvitacionesUsuarios.Add(inv);
                creadas.Add(inv);
            }

            await _context.SaveChangesAsync();
            return creadas;
        }

        public async Task<InvitacionUsuario> CrearInvitacionInquilinoAsync(CrearInvitacionInquilinoDto dto, int idUsuarioCreador)
        {
            if (dto.IDUnidadHabitacional <= 0)
                throw new ArgumentException("Debe especificar una unidad habitacional válida.");

            if (string.IsNullOrWhiteSpace(dto.EmailDestino))
                throw new ArgumentException("El email de destino es obligatorio.");

            var unidad = await _context.UnidadesHabitacionales
                .Include(u => u.Complejo)
                .FirstOrDefaultAsync(u => u.IDUnidadHabitacional == dto.IDUnidadHabitacional);

            if (unidad == null)
                throw new KeyNotFoundException("La unidad habitacional especificada no existe.");

            var inv = new InvitacionUsuario
            {
                IDConsorcio = unidad.Complejo?.IDConsorcio,
                IDComplejo = unidad.IDComplejo,
                IDUnidadHabitacional = dto.IDUnidadHabitacional,
                EmailDestino = dto.EmailDestino.Trim().ToLower(),
                Token = Guid.NewGuid().ToString("N"),
                RolDestino = "INQUILINO",
                Estado = "PENDIENTE",
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = DateTime.UtcNow.AddDays(7),
                IDUsuarioCreador = idUsuarioCreador > 0 ? idUsuarioCreador : null
            };

            _context.InvitacionesUsuarios.Add(inv);
            await _context.SaveChangesAsync();
            return inv;
        }

        public async Task<ValidarTokenResponseDto> ValidarTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return new ValidarTokenResponseDto
                {
                    Valido = false,
                    Mensaje = "El token enviado es nulo o vacío."
                };
            }

            var inv = await _context.InvitacionesUsuarios
                .Include(i => i.Consorcio)
                .Include(i => i.Complejo)
                .Include(i => i.UnidadHabitacional)
                .FirstOrDefaultAsync(i => i.Token == token);

            if (inv == null)
            {
                return new ValidarTokenResponseDto
                {
                    Token = token,
                    Valido = false,
                    Mensaje = "La invitación no fue encontrada."
                };
            }

            if (inv.Estado != "PENDIENTE")
            {
                return new ValidarTokenResponseDto
                {
                    Token = token,
                    Valido = false,
                    EmailDestino = inv.EmailDestino,
                    RolDestino = inv.RolDestino,
                    Mensaje = $"La invitación ya fue {inv.Estado.ToLower()}."
                };
            }

            if (inv.FechaExpiracion < DateTime.UtcNow)
            {
                inv.Estado = "EXPIRADA";
                await _context.SaveChangesAsync();

                return new ValidarTokenResponseDto
                {
                    Token = token,
                    Valido = false,
                    EmailDestino = inv.EmailDestino,
                    RolDestino = inv.RolDestino,
                    Mensaje = "La invitación ha expirado."
                };
            }

            var existeUsuario = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == inv.EmailDestino.ToLower());

            return new ValidarTokenResponseDto
            {
                Token = token,
                Valido = true,
                EmailDestino = inv.EmailDestino,
                RolDestino = inv.RolDestino,
                NombreConsorcio = inv.Consorcio?.Nombre,
                NombreComplejo = inv.Complejo?.Nombre,
                IdentificadorUnidad = inv.UnidadHabitacional?.Identificador,
                EsUsuarioExistente = existeUsuario,
                Mensaje = "Invitación válida."
            };
        }

        public async Task<Usuario> AceptarInvitacionAsync(AceptarInvitacionRequestDto dto)
        {
            var validacion = await ValidarTokenAsync(dto.Token);
            if (!validacion.Valido)
                throw new InvalidOperationException(validacion.Mensaje);

            var inv = await _context.InvitacionesUsuarios.FirstAsync(i => i.Token == dto.Token);

            var email = inv.EmailDestino.ToLower();
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (usuario == null)
            {
                var username = !string.IsNullOrWhiteSpace(inv.EmailDestino)
                    ? inv.EmailDestino.Split('@')[0]
                    : "user_" + Guid.NewGuid().ToString("N").Substring(0, 8);

                // Evitar colisión de Username
                int index = 1;
                var baseUsername = username;
                while (await _context.Usuarios.AnyAsync(u => u.Username.ToLower() == username.ToLower()))
                {
                    username = $"{baseUsername}{index++}";
                }

                usuario = new Usuario
                {
                    Username = username,
                    Email = email,
                    Password = dto.Password,
                    Rol = inv.RolDestino,
                    Activo = true
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();
            }

            // Asignar el rol en PB_UsuarioRol
            var rolEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Codigo == inv.RolDestino);
            if (rolEntity != null)
            {
                var existeRol = await _context.UsuariosRoles
                    .AnyAsync(ur => ur.IDUsuario == usuario.IDUsuario && ur.IDRol == rolEntity.IDRol);

                if (!existeRol)
                {
                    _context.UsuariosRoles.Add(new UsuarioRol
                    {
                        IDUsuario = usuario.IDUsuario,
                        IDRol = rolEntity.IDRol
                    });
                }
            }

            // Vincular Unidad Habitacional si la invitación o el DTO la especifican
            int? idUnidad = inv.IDUnidadHabitacional ?? dto.IDUnidadHabitacional;
            if (idUnidad.HasValue && idUnidad.Value > 0)
            {
                var estadoRelacion = inv.RolDestino == "PROPIETARIO"
                    ? "PENDIENTE_APROBACION_ADMIN"
                    : "VIGENTE";

                var existeRel = await _context.UsuariosUnidades
                    .AnyAsync(uu => uu.IDUsuario == usuario.IDUsuario && uu.IDUnidadHabitacional == idUnidad.Value && uu.TipoRelacion == inv.RolDestino);

                if (!existeRel)
                {
                    _context.UsuariosUnidades.Add(new UsuarioUnidad
                    {
                        IDUsuario = usuario.IDUsuario,
                        IDUnidadHabitacional = idUnidad.Value,
                        TipoRelacion = inv.RolDestino,
                        EsOcupanteActual = dto.EsOcupanteActual,
                        EstadoRelacion = estadoRelacion
                    });
                }
            }

            inv.Estado = "ACEPTADA";
            inv.FechaAceptacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return usuario;
        }
    }
}
