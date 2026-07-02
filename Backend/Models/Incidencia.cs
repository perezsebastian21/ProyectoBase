using System;

namespace ProyectoBase.Models
{
    public class Incidencia
    {
        public int IDIncidencia { get; set; }
        public int IDAmenity { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string Descripcion { get; set; }
        public string Estado { get; set; }
        public string DetalleResolucion { get; set; }
        public decimal? CostoEstimado { get; set; }
        public DateTime FechaReporte { get; set; }
        public DateTime? FechaResolucion { get; set; }
        public Amenity Amenity { get; set; }
        public UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
