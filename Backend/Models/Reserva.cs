using System;

namespace ProyectoBase.Models
{
    public class Reserva
    {
        public int IDReserva { get; set; }
        public int IDAmenity { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public DateOnly FechaUso { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public int CantidadInvitados { get; set; }
        public string Estado { get; set; }
        public DateTime FechaSolicitud { get; set; }
        public Amenity Amenity { get; set; }
        public UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
