using System;

namespace ProyectoBase.Models
{
    public class UnidadHabitacional
    {
        public int IDUnidadHabitacional { get; set; }
        public int IDComplejo { get; set; }
        public string Identificador { get; set; }
        public bool DebeExpensas { get; set; }
        public decimal SaldoActual { get; set; }
        public string EstadoUnidad { get; set; }
        public int ContadorInfracciones { get; set; }
        public Complejo Complejo { get; set; }
    }
}
