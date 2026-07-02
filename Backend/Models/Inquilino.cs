using System;

namespace ProyectoBase.Models
{
    public class Inquilino
    {
        public int IDInquilino { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Dni { get; set; }
        public string Telefono { get; set; }
        public bool Activo { get; set; }
        public UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
