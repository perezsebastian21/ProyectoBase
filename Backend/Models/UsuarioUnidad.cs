using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBase.Models
{
    [Table("PB_UsuarioUnidad")]
    public class UsuarioUnidad
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDUsuarioUnidad { get; set; }

        [Required]
        public int IDUsuario { get; set; }

        [Required]
        public int IDUnidadHabitacional { get; set; }

        [Required]
        [MaxLength(20)]
        public string TipoRelacion { get; set; } = "INQUILINO"; // "PROPIETARIO" | "INQUILINO"

        public bool EsOcupanteActual { get; set; } = true;

        [ForeignKey("IDUsuario")]
        public virtual Usuario? Usuario { get; set; }

        [ForeignKey("IDUnidadHabitacional")]
        public virtual UnidadHabitacional? UnidadHabitacional { get; set; }
    }
}
