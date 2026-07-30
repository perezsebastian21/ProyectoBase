using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;

namespace ProyectoBase.Services
{
    public class SlotDisponibilidadDto
    {
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public string EstadoSlot { get; set; } = "LIBRE"; // "LIBRE" | "OCUPADO" | "MANTENIMIENTO" | "SUSPENDIDO"
        public int CapacidadMaxima { get; set; }
        public int ReservasConfirmadas { get; set; }
        public bool BloqueadoPorIncidencia { get; set; }
        public bool BloqueadoPorMantenimiento { get; set; }
    }

    public class DisponibilidadResponseDto
    {
        public int IDAmenity { get; set; }
        public string NombreAmenity { get; set; } = string.Empty;
        public DateOnly Fecha { get; set; }
        public bool AmenityHabilitado { get; set; } = true;
        public string? MotivoInhabilitado { get; set; }
        public List<SlotDisponibilidadDto> Slots { get; set; } = new();
    }

    public class DisponibilidadService
    {
        private readonly ApplicationDbContext _context;

        public DisponibilidadService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DisponibilidadResponseDto> ConsultarDisponibilidadAsync(int idAmenity, DateOnly fecha)
        {
            var amenity = await _context.Amenities
                .Include(a => a.Config)
                .FirstOrDefaultAsync(a => a.IDAmenity == idAmenity);

            if (amenity == null)
            {
                throw new NotFoundException($"No se encontró el amenity con ID {idAmenity}.");
            }

            var response = new DisponibilidadResponseDto
            {
                IDAmenity = amenity.IDAmenity,
                NombreAmenity = amenity.Nombre,
                Fecha = fecha
            };

            // BR-DISP-002: Verificar si el amenity está totalmente inhabilitado por estado
            if (amenity.Estado == "FUERA_DE_SERVICIO" || amenity.Estado == "MANTENIMIENTO")
            {
                response.AmenityHabilitado = false;
                response.MotivoInhabilitado = $"Amenity fuera de servicio (Estado: {amenity.Estado})";
                return response;
            }

            var config = amenity.Config;
            if (config == null)
            {
                response.AmenityHabilitado = false;
                response.MotivoInhabilitado = "El amenity no posee configuración de horarios registrada.";
                return response;
            }

            // Consultar reservas activas en esa fecha
            var reservas = await _context.Reservas
                .Where(r => r.IDAmenity == idAmenity && r.FechaUso == fecha && r.Estado != "CANCELADA" && r.Estado != "RECHAZADA")
                .ToListAsync();

            // Consultar mantenimientos programados activos en esa fecha
            var mantenimientos = await _context.MantenimientosProgramados
                .Where(m => m.IDAmenity == idAmenity && fecha >= m.FechaInicio && fecha <= m.FechaFin)
                .ToListAsync();

            // Consultar incidencias graves activas
            var incidencias = await _context.Incidencias
                .Where(i => i.IDAmenity == idAmenity && (i.Estado == "REPORTADA" || i.Estado == "EN_REPARACION"))
                .ToListAsync();

            // Generar slots basados en la configuración
            var horaActual = config.HorarioInicio;
            var horaFinGeneral = config.HorarioFin;
            int duracion = config.DuracionBloqueMinutos > 0 ? config.DuracionBloqueMinutos : 60;
            int limpieza = config.TiempoLimpiezaMinutos;

            while (horaActual.AddMinutes(duracion) <= horaFinGeneral && horaActual < horaFinGeneral)
            {
                var slotFin = horaActual.AddMinutes(duracion);

                var slot = new SlotDisponibilidadDto
                {
                    HoraInicio = horaActual,
                    HoraFin = slotFin,
                    CapacidadMaxima = amenity.Capacidad
                };

                // Evaluar mantenimientos en este bloque
                bool enMantenimiento = mantenimientos.Any(m => m.HoraInicio < slotFin && m.HoraFin > horaActual);
                if (enMantenimiento)
                {
                    slot.BloqueadoPorMantenimiento = true;
                    slot.EstadoSlot = "MANTENIMIENTO";
                }

                // Evaluar incidencias en este bloque
                bool enIncidencia = incidencias.Any();
                if (enIncidencia && !slot.BloqueadoPorMantenimiento)
                {
                    slot.BloqueadoPorIncidencia = true;
                    slot.EstadoSlot = "SUSPENDIDO";
                }

                // Evaluar reservas ocupadas
                int conteoReservas = reservas.Count(r => r.HoraInicio < slotFin && r.HoraFin > horaActual);
                slot.ReservasConfirmadas = conteoReservas;

                if (slot.EstadoSlot == "LIBRE" && conteoReservas >= amenity.Capacidad)
                {
                    slot.EstadoSlot = "OCUPADO";
                }

                response.Slots.Add(slot);

                // Avanzar al siguiente bloque (duración + tiempo de limpieza)
                horaActual = slotFin.AddMinutes(limpieza);
            }

            return response;
        }
    }
}
