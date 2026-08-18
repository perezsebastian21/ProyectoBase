using System.ComponentModel.DataAnnotations;

namespace ProyectoBase.DTOs.Invitacion
{
    public class CrearInvitacionAdminDto
    {
        [Required]
        [EmailAddress]
        public string EmailDestino { get; set; }

        public string Nombre { get; set; }
        public string Apellido { get; set; }
    }
}
