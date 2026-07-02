using System;

namespace ProyectoBase.Models
{
    public class Amenity
    {
        public int IDAmenity { get; set; }
        public int IDComplejo { get; set; }
        public string Nombre { get; set; }
        public int Capacidad { get; set; }
        public string Estado { get; set; }
        public Complejo Complejo { get; set; }
        public AmenityConfig Config { get; set; }
    }
}
