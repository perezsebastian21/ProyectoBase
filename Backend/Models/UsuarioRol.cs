using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBase.Models
{
    public class UsuarioRol
    {
        [Key]
        public int IDUsuarioRol { get; set; }

        [Required]
        public int IDUsuario { get; set; }

        [Required]
        public int IDRol { get; set; }

        [ForeignKey("IDUsuario")]
        public Usuario Usuario { get; set; }

        [ForeignKey("IDRol")]
        public Rol Rol { get; set; }
    }
}
