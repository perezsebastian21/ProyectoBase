using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;

namespace ProyectoBase.Services
{
    public class ConfigAplicadaDto
    {
        public TimeOnly HorarioInicio { get; set; }
        public TimeOnly HorarioFin { get; set; }
        public int DuracionBloqueMinutos { get; set; }
        public int TiempoLimpiezaMinutos { get; set; }
        public decimal Tarifa { get; set; }
        public int LimiteReservasMesUnidad { get; set; }
        public bool RequiereAprobacion { get; set; }
    }

    public class SlotDisponibilidadDto
    {
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public bool Disponible { get; set; }
        public string MotivoNoDisponible { get; set; }
    }

    public class DisponibilidadDiaDto
    {
        public DateOnly Fecha { get; set; }
        public List<SlotDisponibilidadDto> Slots { get; set; } = new();
    }

    public class DisponibilidadResponseDto
    {
        public int IDAmenity { get; set; }
        public string NombreAmenity { get; set; } = string.Empty;
        public string EstadoAmenity { get; set; } = "DISPONIBLE";
        public ConfigAplicadaDto Configuracion { get; set; }
        public DateOnly VentanaConsultableDesde { get; set; }
        public DateOnly VentanaConsultableHasta { get; set; }
        public int? CupoRestanteUnidadMes { get; set; }
        public List<DisponibilidadDiaDto> Dias { get; set; } = new();
    }

    public class DisponibilidadService
    {
        private readonly ApplicationDbContext _context;

        public DisponibilidadService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DisponibilidadResponseDto> ConsultarDisponibilidadAsync(
            int idAmenity,
            DateOnly fechaDesde,
            DateOnly? fechaHasta = null,
            int? idUnidadHabitacional = null)
        {
            var amenity = await _context.Amenities
                .Include(a => a.Config)
                .FirstOrDefaultAsync(a => a.IDAmenity == idAmenity);

            if (amenity == null)
            {
                throw new NotFoundException($"No se encontró el amenity con ID {idAmenity}.");
            }

            DateOnly inicio = fechaDesde;
            DateOnly fin = fechaHasta ?? fechaDesde;
            if (fin < inicio) fin = inicio;

            var response = new DisponibilidadResponseDto
            {
                IDAmenity = amenity.IDAmenity,
                NombreAmenity = amenity.Nombre,
                EstadoAmenity = amenity.Estado ?? "DISPONIBLE",
                VentanaConsultableDesde = inicio,
                VentanaConsultableHasta = fin
            };

            var config = amenity.Config;
            if (config != null)
            {
                response.Configuracion = new ConfigAplicadaDto
                {
                    HorarioInicio = config.HorarioInicio,
                    HorarioFin = config.HorarioFin,
                    DuracionBloqueMinutos = config.DuracionBloqueMinutos,
                    TiempoLimpiezaMinutos = config.TiempoLimpiezaMinutos,
                    Tarifa = config.Tarifa,
                    LimiteReservasMesUnidad = config.LimiteReservasMesUnidad,
                    RequiereAprobacion = config.RequiereAprobacion
                };
            }

            // Calcular cupo restante para la unidad en el mes si corresponde
            if (idUnidadHabitacional.HasValue && config != null && config.LimiteReservasMesUnidad > 0)
            {
                var primerDiaMes = new DateOnly(inicio.Year, inicio.Month, 1);
                var ultimoDiaMes = primerDiaMes.AddMonths(1).AddDays(-1);

                int reservasDelMes = await _context.Reservas
                    .CountAsync(r => r.IDAmenity == idAmenity &&
                                     r.IDUnidadHabitacional == idUnidadHabitacional.Value &&
                                     r.FechaUso >= primerDiaMes &&
                                     r.FechaUso <= ultimoDiaMes &&
                                     r.Estado != "CANCELADA" &&
                                     r.Estado != "RECHAZADA");

                int cupoRestante = config.LimiteReservasMesUnidad - reservasDelMes;
                response.CupoRestanteUnidadMes = cupoRestante > 0 ? cupoRestante : 0;
            }

            // Consultar datos de reservas, mantenimientos e incidencias en el rango
            var reservas = await _context.Reservas
                .Where(r => r.IDAmenity == idAmenity && r.FechaUso >= inicio && r.FechaUso <= fin && r.Estado != "CANCELADA" && r.Estado != "RECHAZADA")
                .ToListAsync();

            var mantenimientos = await _context.MantenimientosProgramados
                .Where(m => m.IDAmenity == idAmenity && m.FechaInicio <= fin && m.FechaFin >= inicio)
                .ToListAsync();

            var incidencias = await _context.Incidencias
                .Where(i => i.IDAmenity == idAmenity && (i.Estado == "REPORTADA" || i.Estado == "EN_REPARACION"))
                .ToListAsync();

            for (var diaActual = inicio; diaActual <= fin; diaActual = diaActual.AddDays(1))
            {
                var diaDto = new DisponibilidadDiaDto { Fecha = diaActual };

                if (amenity.Estado == "FUERA_DE_SERVICIO" || amenity.Estado == "MANTENIMIENTO")
                {
                    // Si el amenity está inhabilitado globalmente
                    var slotInhabilitado = new SlotDisponibilidadDto
                    {
                        HoraInicio = config?.HorarioInicio ?? new TimeOnly(8, 0),
                        HoraFin = config?.HorarioFin ?? new TimeOnly(22, 0),
                        Disponible = false,
                        MotivoNoDisponible = amenity.Estado
                    };
                    diaDto.Slots.Add(slotInhabilitado);
                    response.Dias.Add(diaDto);
                    continue;
                }

                if (config == null)
                {
                    response.Dias.Add(diaDto);
                    continue;
                }

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
                        Disponible = true,
                        MotivoNoDisponible = null
                    };

                    // Evaluar mantenimientos en este bloque
                    bool enMantenimiento = mantenimientos.Any(m => m.FechaInicio <= diaActual && m.FechaFin >= diaActual && m.HoraInicio < slotFin && m.HoraFin > horaActual);
                    if (enMantenimiento)
                    {
                        slot.Disponible = false;
                        slot.MotivoNoDisponible = "MANTENIMIENTO";
                    }

                    // Evaluar incidencias
                    bool enIncidencia = incidencias.Any();
                    if (enIncidencia && slot.Disponible)
                    {
                        slot.Disponible = false;
                        slot.MotivoNoDisponible = "FUERA_DE_SERVICIO";
                    }

                    // Evaluar reservas ocupadas
                    int conteoReservas = reservas.Count(r => r.FechaUso == diaActual && r.HoraInicio < slotFin && r.HoraFin > horaActual);
                    if (slot.Disponible && conteoReservas >= amenity.Capacidad)
                    {
                        slot.Disponible = false;
                        slot.MotivoNoDisponible = "OCUPADO";
                    }

                    diaDto.Slots.Add(slot);
                    horaActual = slotFin.AddMinutes(limpieza);
                }

                response.Dias.Add(diaDto);
            }

            return response;
        }
    }
}
