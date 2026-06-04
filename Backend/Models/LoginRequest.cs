namespace ProyectoBase.Models
{
    /// <summary>
    /// DTO de entrada para el endpoint de login.
    /// No es una entidad de dominio — no tiene tabla en la base de datos.
    /// </summary>
    public class LoginRequest
    {
        public string Usuario { get; set; }
        public string Password { get; set; }
    }
}
