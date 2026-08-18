using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProyectoBase.DTOs.Invitacion
{
    public class InvitacionUnidadItemDto
    {
        public int? IDUnidadHabitacional { get; set; }

        [Required]
        [EmailAddress]
        public string EmailDestino { get; set; }
    }

    public class CrearInvitacionesMasivasDto
    {
        [Required]
        public int IDConsorcio { get; set; }

        public int? IDComplejo { get; set; }

        public List<InvitacionUnidadItemDto> Invitaciones { get; set; } = new List<InvitacionUnidadItemDto>();
    }
}
