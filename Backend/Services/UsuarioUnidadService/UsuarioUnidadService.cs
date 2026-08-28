using Microsoft.EntityFrameworkCore;
using ProyectoBase.DTOs.UsuarioUnidad;
using ProyectoBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProyectoBase.Services.UsuarioUnidadService
{
    public class UsuarioUnidadService : IUsuarioUnidadService
    {
        private readonly ApplicationDbContext _context;

        public UsuarioUnidadService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UsuarioUnidadPendienteDto>> ObtenerPendientesAsync(int? idConsorcio)
        {
            var query = _context.UsuariosUnidades
                .Include(uu => uu.Usuario)
                .Include(uu => uu.UnidadHabitacional)
                    .ThenInclude(u => u.Complejo)
                        .ThenInclude(c => c.Consorcio)
                .Where(uu => uu.EstadoRelacion == "PENDIENTE_APROBACION_ADMIN");

            if (idConsorcio.HasValue && idConsorcio.Value > 0)
            {
                query = query.Where(uu => uu.UnidadHabitacional.Complejo.IDConsorcio == idConsorcio.Value);
            }

            var pendientes = await query.ToListAsync();

            return pendientes.Select(uu => new UsuarioUnidadPendienteDto
            {
                IDUsuarioUnidad = uu.IDUsuarioUnidad,
                IDUsuario = uu.IDUsuario,
                Username = uu.Usuario?.Username,
                Email = uu.Usuario?.Email,
                IDUnidadHabitacional = uu.IDUnidadHabitacional,
                IdentificadorUnidad = uu.UnidadHabitacional?.Identificador,
                NombreConsorcio = uu.UnidadHabitacional?.Complejo?.Consorcio?.Nombre,
                TipoRelacion = uu.TipoRelacion,
                EsOcupanteActual = uu.EsOcupanteActual,
                EstadoRelacion = uu.EstadoRelacion,
                FechaInicio = DateTime.UtcNow
            });
        }

        public async Task<IEnumerable<MiUnidadDto>> ObtenerMisUnidadesAsync(int idUsuario)
        {
            var misUnidades = await _context.UsuariosUnidades
                .Include(uu => uu.UnidadHabitacional)
                    .ThenInclude(u => u.Complejo)
                        .ThenInclude(c => c.Consorcio)
                .Where(uu => uu.IDUsuario == idUsuario && uu.EstadoRelacion == "VIGENTE")
                .ToListAsync();

            return misUnidades.Select(uu => new MiUnidadDto
            {
                IDUsuarioUnidad = uu.IDUsuarioUnidad,
                IDUnidadHabitacional = uu.IDUnidadHabitacional,
                IdentificadorUnidad = uu.UnidadHabitacional?.Identificador,
                IDComplejo = uu.UnidadHabitacional?.IDComplejo,
                NombreComplejo = uu.UnidadHabitacional?.Complejo?.Nombre,
                IDConsorcio = uu.UnidadHabitacional?.Complejo?.IDConsorcio,
                NombreConsorcio = uu.UnidadHabitacional?.Complejo?.Consorcio?.Nombre,
                TipoRelacion = uu.TipoRelacion,
                EsOcupanteActual = uu.EsOcupanteActual,
                EstadoRelacion = uu.EstadoRelacion
            });
        }

        public async Task<UsuarioUnidad> AprobarUsuarioUnidadAsync(int idUsuarioUnidad)
        {
            var uu = await _context.UsuariosUnidades
                .Include(u => u.Usuario)
                .Include(u => u.UnidadHabitacional)
                .FirstOrDefaultAsync(u => u.IDUsuarioUnidad == idUsuarioUnidad);

            if (uu == null)
                throw new KeyNotFoundException($"La solicitud de vinculación con ID {idUsuarioUnidad} no existe.");

            if (uu.EstadoRelacion != "PENDIENTE_APROBACION_ADMIN")
                throw new InvalidOperationException($"La vinculación no está pendiente de aprobación (Estado actual: {uu.EstadoRelacion}).");

            uu.EstadoRelacion = "VIGENTE";
            await _context.SaveChangesAsync();
            return uu;
        }

        public async Task<UsuarioUnidad> RechazarUsuarioUnidadAsync(int idUsuarioUnidad, string motivoRechazo)
        {
            var uu = await _context.UsuariosUnidades
                .Include(u => u.Usuario)
                .Include(u => u.UnidadHabitacional)
                .FirstOrDefaultAsync(u => u.IDUsuarioUnidad == idUsuarioUnidad);

            if (uu == null)
                throw new KeyNotFoundException($"La solicitud de vinculación con ID {idUsuarioUnidad} no existe.");

            if (uu.EstadoRelacion != "PENDIENTE_APROBACION_ADMIN")
                throw new InvalidOperationException($"La vinculación no está pendiente de aprobación (Estado actual: {uu.EstadoRelacion}).");

            uu.EstadoRelacion = "RECHAZADA";
            uu.MotivoRechazo = string.IsNullOrWhiteSpace(motivoRechazo) ? "Solicitud rechazada por el Administrador." : motivoRechazo;
            await _context.SaveChangesAsync();
            return uu;
        }
    }
}
