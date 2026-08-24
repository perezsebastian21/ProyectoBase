using System.ComponentModel.DataAnnotations;

namespace ProyectoBase.DTOs.Invitacion
{
    public class CrearInvitacionInquilinoDto
    {
        [Required]
        public int IDUnidadHabitacional { get; set; }

        [Required]
        [EmailAddress]
        public string EmailDestino { get; set; }
    }
}
