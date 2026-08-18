using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBase.Models
{
    public class InvitacionUsuario
    {
        [Key]
        public int IDInvitacion { get; set; }

        public int? IDConsorcio { get; set; }
        public int? IDComplejo { get; set; }
        public int? IDUnidadHabitacional { get; set; }

        [Required]
        [StringLength(250)]
        public string EmailDestino { get; set; }

        [StringLength(50)]
        public string TelefonoDestino { get; set; }

        [Required]
        [StringLength(100)]
        public string Token { get; set; }

        [Required]
        [StringLength(30)]
        public string RolDestino { get; set; } // "ADMINISTRADOR_AVANZADO", "PROPIETARIO", "INQUILINO", "GUARDIA", "INVITADO"

        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "PENDIENTE"; // "PENDIENTE", "ACEPTADA", "EXPIRADA", "REVOCADA"

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaExpiracion { get; set; } = DateTime.UtcNow.AddDays(7);
        public DateTime? FechaAceptacion { get; set; }

        public int? IDUsuarioCreador { get; set; }

        [ForeignKey("IDConsorcio")]
        public virtual Consorcio Consorcio { get; set; }

        [ForeignKey("IDComplejo")]
        public virtual Complejo Complejo { get; set; }

        [ForeignKey("IDUnidadHabitacional")]
        public virtual UnidadHabitacional UnidadHabitacional { get; set; }

        [ForeignKey("IDUsuarioCreador")]
        public virtual Usuario UsuarioCreador { get; set; }
    }
}
