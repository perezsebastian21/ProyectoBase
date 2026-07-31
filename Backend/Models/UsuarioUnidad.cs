namespace ProyectoBase.Models
{
    public class UsuarioUnidad
    {
        public int IDUsuarioUnidad { get; set; }
        public int IDUsuario { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string TipoRelacion { get; set; } = "INQUILINO"; // "PROPIETARIO" | "INQUILINO"
        public bool EsOcupanteActual { get; set; } = true;

        public virtual Usuario Usuario { get; set; }
        public virtual UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
