using System;

namespace ProyectoBase.Models
{
    public class AuditLog
    {
        public int IDAuditLog { get; set; }
        public string Usuario { get; set; }
        public string Accion { get; set; }
        public string Entidad { get; set; }
        public int EntidadId { get; set; }
        public DateTime FechaHora { get; set; }
        public string Detalle { get; set; }
    }
}
