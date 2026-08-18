using System;

namespace ProyectoBase.DTOs.UsuarioUnidad
{
    public class UsuarioUnidadPendienteDto
    {
        public int IDUsuarioUnidad { get; set; }
        public int IDUsuario { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string IdentificadorUnidad { get; set; }
        public string NombreConsorcio { get; set; }
        public string TipoRelacion { get; set; }
        public bool EsOcupanteActual { get; set; }
        public string EstadoRelacion { get; set; }
        public DateTime FechaInicio { get; set; }
    }
}
