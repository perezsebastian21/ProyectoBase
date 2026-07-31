using System;

namespace ProyectoBase.Models.DTOs
{
    public class ReservaRequestDto
    {
        public int IDAmenity { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public DateOnly FechaUso { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public int CantidadInvitados { get; set; } = 0;
    }

    public class ReservaResponseDto
    {
        public int IDReserva { get; set; }
        public int IDAmenity { get; set; }
        public string NombreAmenity { get; set; } = string.Empty;
        public int IDUnidadHabitacional { get; set; }
        public DateOnly FechaUso { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public int CantidadInvitados { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaSolicitud { get; set; }
        public decimal MontoRetenido { get; set; }
    }
}
