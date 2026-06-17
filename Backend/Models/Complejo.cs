namespace ProyectoBase.Models
{
    public class Complejo
    {
        public int IDComplejo { get; set; }
        public int IDConsorcio { get; set; }
        public string Nombre { get; set; }
        public string Tipo { get; set; }
        public string Direccion { get; set; }
        public Consorcio Consorcio { get; set; }
    }
}
