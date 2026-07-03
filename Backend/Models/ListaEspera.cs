using System;

namespace ProyectoBase.Models
{
    public class ListaEspera
    {
        public int IDListaEspera { get; set; }
        public int IDAmenity { get; set; }
        public int IDUnidadHabitacional { get; set; }
        public DateOnly FechaUso { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public int Posicion { get; set; }
        public DateTime FechaInscripcion { get; set; }
        public string Estado { get; set; }
        
        public Amenity Amenity { get; set; }
        public UnidadHabitacional UnidadHabitacional { get; set; }
    }
}
