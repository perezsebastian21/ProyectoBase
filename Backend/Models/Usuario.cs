namespace ProyectoBase.Models
{
    public class Usuario
    {
        public int IDUsuario { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public bool Activo { get; set; } = true;
    }
}
