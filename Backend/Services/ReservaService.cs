using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Exceptions;
using ProyectoBase.Models;
using ProyectoBase.Models.DTOs;

namespace ProyectoBase.Services
{
    public class ReservaService
    {
        private readonly ApplicationDbContext _context;

        public ReservaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReservaResponseDto> CrearReservaAsync(ReservaRequestDto dto)
        {
            if (dto == null)
            {
                throw new BadRequestException("El cuerpo de la solicitud no puede estar vacío.");
            }

            // 1. Validar existencia del Amenity y su Configuración
            var amenity = await _context.Amenities
                .Include(a => a.Config)
                .FirstOrDefaultAsync(a => a.IDAmenity == dto.IDAmenity);

            if (amenity == null)
            {
                throw new NotFoundException($"No se encontró el amenity con ID {dto.IDAmenity}.");
            }

            if (amenity.Estado == "FUERA_DE_SERVICIO" || amenity.Estado == "MANTENIMIENTO")
            {
                throw new BadRequestException($"El amenity '{amenity.Nombre}' se encuentra actualmente fuera de servicio por mantenimiento.");
            }

            var config = amenity.Config;
            if (config == null)
            {
                throw new BadRequestException($"El amenity '{amenity.Nombre}' no posee configuración de horarios registrada.");
            }

            // 2. Validar existencia de la Unidad Habitacional
            var unidad = await _context.UnidadesHabitacionales
                .FirstOrDefaultAsync(u => u.IDUnidadHabitacional == dto.IDUnidadHabitacional);

            if (unidad == null)
            {
                throw new NotFoundException($"No se encontró la unidad habitacional con ID {dto.IDUnidadHabitacional}.");
            }

            // 3. Calcular HoraFin basada en la duración del bloque de la configuración
            int duracionBloque = config.DuracionBloqueMinutos > 0 ? config.DuracionBloqueMinutos : 60;
            TimeOnly horaFin = dto.HoraInicio.AddMinutes(duracionBloque);

            // Validar que el horario esté dentro del rango operativo del amenity
            if (dto.HoraInicio < config.HorarioInicio || horaFin > config.HorarioFin)
            {
                throw new BadRequestException($"El horario solicitado ({dto.HoraInicio:HH\\:mm} - {horaFin:HH\\:mm}) está fuera del horario operativo del amenity ({config.HorarioInicio:HH\\:mm} - {config.HorarioFin:HH\\:mm}).");
            }

            // 4. Validar capacidad de reservas en el slot horario (Overbooking)
            int reservasExistentes = await _context.Reservas
                .CountAsync(r => r.IDAmenity == dto.IDAmenity &&
                                 r.FechaUso == dto.FechaUso &&
                                 r.HoraInicio < horaFin &&
                                 r.HoraFin > dto.HoraInicio &&
                                 r.Estado != "CANCELADA" &&
                                 r.Estado != "RECHAZADA");

            if (reservasExistentes >= amenity.Capacidad)
            {
                throw new BadRequestException("El turno seleccionado ya alcanzó la capacidad máxima permitida de reservas.");
            }

            // 5. Determinar Estado Inicial de la Reserva
            string estadoInicial = "CONFIRMADA";
            if (config.Tarifa > 0)
            {
                estadoInicial = "PENDIENTE_PAGO";
            }
            else if (config.RequiereAprobacion)
            {
                estadoInicial = "PENDIENTE_APROBACION";
            }

            // 6. Crear la entidad Reserva
            var reserva = new Reserva
            {
                IDAmenity = dto.IDAmenity,
                IDUnidadHabitacional = dto.IDUnidadHabitacional,
                FechaUso = dto.FechaUso,
                HoraInicio = dto.HoraInicio,
                HoraFin = horaFin,
                CantidadInvitados = dto.CantidadInvitados,
                Estado = estadoInicial,
                FechaSolicitud = DateTime.UtcNow,
                CheckInRealizado = false,
                MontoRetenido = config.Tarifa
            };

            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            return new ReservaResponseDto
            {
                IDReserva = reserva.IDReserva,
                IDAmenity = reserva.IDAmenity,
                NombreAmenity = amenity.Nombre,
                IDUnidadHabitacional = reserva.IDUnidadHabitacional,
                FechaUso = reserva.FechaUso,
                HoraInicio = reserva.HoraInicio,
                HoraFin = reserva.HoraFin,
                CantidadInvitados = reserva.CantidadInvitados,
                Estado = reserva.Estado,
                FechaSolicitud = reserva.FechaSolicitud,
                MontoRetenido = reserva.MontoRetenido
            };
        }
    }
}
