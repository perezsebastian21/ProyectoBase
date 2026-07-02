using System;

namespace ProyectoBase.Models
{
    public class Invitado
    {
        public int IDInvitado { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string NombreCompleto { get; set; }
        public string Dni { get; set; }
        public DateOnly FechaExpiracion { get; set; }
        public string Patente { get; set; }
        
        public UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
