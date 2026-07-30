using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;

namespace ProyectoBase.Services
{
    public class CancelacionMasivaRequestDto
    {
        public int IDAmenity { get; set; }
        public DateOnly FechaDesde { get; set; }
        public DateOnly? FechaHasta { get; set; }
        public string MotivoAdmin { get; set; } = string.Empty;
        public bool CancelarReservasAfectadas { get; set; } = true;
    }

    public class CancelacionMasivaResultDto
    {
        public int IDAmenity { get; set; }
        public string NombreAmenity { get; set; } = string.Empty;
        public string NuevoEstadoAmenity { get; set; } = "FUERA_DE_SERVICIO";
        public int ReservasCanceladasCount { get; set; }
        public int ListasEsperaInhabilitadasCount { get; set; }
        public string MotivoAdmin { get; set; } = string.Empty;
        public DateTime FechaEjecucion { get; set; } = DateTime.UtcNow;
    }

    public class CancelacionMasivaService
    {
        private readonly ApplicationDbContext _context;

        public CancelacionMasivaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CancelacionMasivaResultDto> EjecutarCancelacionMasivaAsync(CancelacionMasivaRequestDto dto)
        {
            var amenity = await _context.Amenities.FindAsync(dto.IDAmenity);
            if (amenity == null)
            {
                throw new NotFoundException($"No se encontró el amenity con ID {dto.IDAmenity}.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                amenity.Estado = "FUERA_DE_SERVICIO";

                int reservasCanceladas = 0;
                int listasInhabilitadas = 0;

                if (dto.CancelarReservasAfectadas)
                {
                    var reservasQuery = _context.Reservas.Where(r =>
                        r.IDAmenity == dto.IDAmenity &&
                        r.FechaUso >= dto.FechaDesde &&
                        (r.Estado == "CONFIRMADA" || r.Estado == "PENDIENTE_APROBACION" || r.Estado == "PENDIENTE_PAGO"));

                    if (dto.FechaHasta.HasValue)
                    {
                        reservasQuery = reservasQuery.Where(r => r.FechaUso <= dto.FechaHasta.Value);
                    }

                    var reservasAfectadas = await reservasQuery.ToListAsync();
                    foreach (var res in reservasAfectadas)
                    {
                        res.Estado = "CANCELADA_ADMINISTRATIVA";
                        res.MontoRetenido = 0.00m; // Reembolso 100% sin penalización
                    }
                    reservasCanceladas = reservasAfectadas.Count;

                    var listasQuery = _context.ListasEspera.Where(l =>
                        l.IDAmenity == dto.IDAmenity &&
                        l.FechaUso >= dto.FechaDesde &&
                        (l.Estado == "ESPERANDO" || l.Estado == "NOTIFICADO"));

                    if (dto.FechaHasta.HasValue)
                    {
                        listasQuery = listasQuery.Where(l => l.FechaUso <= dto.FechaHasta.Value);
                    }

                    var listasAfectadas = await listasQuery.ToListAsync();
                    foreach (var lista in listasAfectadas)
                    {
                        lista.Estado = "EXPIRADO";
                        lista.FechaResolucion = DateTime.UtcNow;
                        lista.MotivoExpiracion = "AMENITY_DESHABILITADO";
                    }
                    listasInhabilitadas = listasAfectadas.Count;
                }

                // Registrar en auditoría
                _context.AuditLogs.Add(new AuditLog
                {
                    Usuario = "ADMIN_SISTEMA",
                    Accion = "CANCELACION_MASIVA",
                    Entidad = "Amenity",
                    EntidadId = dto.IDAmenity,
                    FechaHora = DateTime.UtcNow,
                    Detalle = $"Baja de amenity {amenity.Nombre}. Motivo: {dto.MotivoAdmin}. Reservas canceladas: {reservasCanceladas}. Listas inhabilitadas: {listasInhabilitadas}."
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new CancelacionMasivaResultDto
                {
                    IDAmenity = amenity.IDAmenity,
                    NombreAmenity = amenity.Nombre,
                    NuevoEstadoAmenity = amenity.Estado,
                    ReservasCanceladasCount = reservasCanceladas,
                    ListasEsperaInhabilitadasCount = listasInhabilitadas,
                    MotivoAdmin = dto.MotivoAdmin
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
