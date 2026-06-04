namespace ProyectoBase.Services.TokenService
{
    public interface ITokenService
    {
        /// <summary>
        /// Genera un JWT para el usuario autenticado.
        /// </summary>
        string GenerateAdminToken(string username);
    }
}
