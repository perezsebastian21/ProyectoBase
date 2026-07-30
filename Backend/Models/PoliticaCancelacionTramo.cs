using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBase.Models
{
    [Table("PB_PoliticaCancelacionTramo")]
    public class PoliticaCancelacionTramo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IDTramo { get; set; }

        public int? IDAmenityConfig { get; set; } // FK nullable -> null = global del tenant

        [Required]
        public int HorasAntesDesde { get; set; }

        [Required]
        public int HorasAntesHasta { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal PorcentajePenalidad { get; set; } // 0-100

        [ForeignKey("IDAmenityConfig")]
        public virtual AmenityConfig? AmenityConfig { get; set; }
    }
}
