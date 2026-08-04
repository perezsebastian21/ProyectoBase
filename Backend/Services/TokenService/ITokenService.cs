namespace ProyectoBase.Services.TokenService
{
    public interface ITokenService
    {
        /// <summary>
        /// Genera un JWT para el usuario autenticado con sus claims de roles.
        /// </summary>
        string GenerateUserToken(ProyectoBase.Models.Usuario usuario);

        /// <summary>
        /// Genera un JWT para el usuario autenticado.
        /// </summary>
        string GenerateAdminToken(string username);
    }
}
