using System;

namespace ProyectoBase.Models
{
    public class Invitado
    {
        public int IDInvitado { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Dni { get; set; }
        public string EstadoAcceso { get; set; }
        public DateTime? HoraIngreso { get; set; }
        public DateTime? HoraEgreso { get; set; }
        public UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
