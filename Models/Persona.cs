using System;

namespace ProyectoBase.Models
{
    public class Persona
    {
        public int IDPersona { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Dni { get; set; }
        public string Email { get; set; }
        public string Celular { get; set; }
    }
}
