namespace ProyectoBase.DTOs.Invitacion
{
    public class ValidarTokenResponseDto
    {
        public string Token { get; set; }
        public bool Valido { get; set; }
        public string EmailDestino { get; set; }
        public string RolDestino { get; set; }
        public string NombreConsorcio { get; set; }
        public string NombreComplejo { get; set; }
        public string IdentificadorUnidad { get; set; }
        public bool EsUsuarioExistente { get; set; }
        public string Mensaje { get; set; }
    }
}
