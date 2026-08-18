using System.ComponentModel.DataAnnotations;

namespace ProyectoBase.DTOs.Invitacion
{
    public class AceptarInvitacionRequestDto
    {
        [Required]
        public string Token { get; set; }

        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Dni { get; set; }
        public string Celular { get; set; }

        [Required]
        public string Password { get; set; }

        public int? IDUnidadHabitacional { get; set; }
        public bool EsOcupanteActual { get; set; } = true;
    }
}
