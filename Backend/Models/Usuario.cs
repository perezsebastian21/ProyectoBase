namespace ProyectoBase.Models
{
    public class Usuario
    {
        public int IDUsuario { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Rol { get; set; } = "INQUILINO"; // "SUPER_ADMINISTRADOR" | "ADMINISTRADOR_AVANZADO" | "ADMINISTRADOR_LIVIANO" | "GUARDIA" | "INQUILINO" | "PROPIETARIO" | "INVITADO"
        public bool Activo { get; set; } = true;
        public System.Collections.Generic.ICollection<UsuarioRol> UsuarioRoles { get; set; } = new System.Collections.Generic.List<UsuarioRol>();
    }
}
