using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBase.Models
{
    [Table("PB_NotificacionIntento")]
    public class NotificacionIntento
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDIntento { get; set; }

        [Required]
        public int IDNotificacion { get; set; }

        [Required]
        [MaxLength(20)]
        public string Canal { get; set; } = "PUSH"; // "PUSH" | "EMAIL" | "WHATSAPP" | "SMS"

        [Required]
        public DateTime EnviadoEn { get; set; } = DateTime.UtcNow;

        public bool Entregado { get; set; } = false;

        public DateTime? EntregadoEn { get; set; }
    }
}
