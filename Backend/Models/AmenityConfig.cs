using System;

namespace ProyectoBase.Models
{
    public class AmenityConfig
    {
        public int IDAmenityConfig { get; set; }
        public int IDAmenity { get; set; }
        public TimeOnly HorarioInicio { get; set; }
        public TimeOnly HorarioFin { get; set; }
        public int DuracionBloqueMinutos { get; set; }
        public int TiempoLimpiezaMinutos { get; set; }
        public decimal Tarifa { get; set; }
        public int LimiteReservasMesUnidad { get; set; }
        public bool RequiereAprobacion { get; set; }
        public Amenity Amenity { get; set; }
    }
}
