using System.ComponentModel.DataAnnotations;

namespace ProyectoBase.Models
{
    public class Rol
    {
        [Key]
        public int IDRol { get; set; }

        [Required]
        [StringLength(30)]
        public string Codigo { get; set; } // "SUPER_ADMINISTRADOR" | "ADMINISTRADOR_AVANZADO" | "ADMINISTRADOR_LIVIANO" | "GUARDIA" | "INQUILINO" | "PROPIETARIO" | "INVITADO"

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }

        [StringLength(250)]
        public string Descripcion { get; set; }
    }
}
