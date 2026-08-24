using System;

namespace ProyectoBase.Models
{
    public class NotificacionIntento
    {
        public int IDIntento { get; set; }
        public int IDNotificacion { get; set; }
        public string Canal { get; set; } = "PUSH"; // "PUSH" | "EMAIL" | "WHATSAPP" | "SMS"
        public DateTime EnviadoEn { get; set; } = DateTime.UtcNow;
        public bool Entregado { get; set; } = false;
        public DateTime? EntregadoEn { get; set; }
    }
}
