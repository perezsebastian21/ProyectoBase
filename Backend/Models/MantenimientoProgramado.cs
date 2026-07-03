using System;

namespace ProyectoBase.Models
{
    public class MantenimientoProgramado
    {
        public int IDMantenimiento { get; set; }
        public int IDAmenity { get; set; }
        public string Descripcion { get; set; }
        public string Recurrencia { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public DateOnly FechaInicio { get; set; }
        public DateOnly FechaFin { get; set; }
        
        public Amenity Amenity { get; set; }
    }
}
