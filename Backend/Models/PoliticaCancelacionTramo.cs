namespace ProyectoBase.Models
{
    public class PoliticaCancelacionTramo
    {
        public int IDTramo { get; set; }
        public int? IDAmenityConfig { get; set; } // FK nullable -> null = global del tenant
        public int HorasAntesDesde { get; set; }
        public int HorasAntesHasta { get; set; }
        public decimal PorcentajePenalidad { get; set; } // 0-100

        public virtual AmenityConfig AmenityConfig { get; set; }
    }
}
