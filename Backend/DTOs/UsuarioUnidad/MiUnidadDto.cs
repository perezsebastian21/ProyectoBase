namespace ProyectoBase.DTOs.UsuarioUnidad
{
    public class MiUnidadDto
    {
        public int IDUsuarioUnidad { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string IdentificadorUnidad { get; set; }
        public int? IDComplejo { get; set; }
        public string NombreComplejo { get; set; }
        public int? IDConsorcio { get; set; }
        public string NombreConsorcio { get; set; }
        public string TipoRelacion { get; set; } // "PROPIETARIO" | "INQUILINO"
        public bool EsOcupanteActual { get; set; }
        public string EstadoRelacion { get; set; } // "VIGENTE"
    }
}
