using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProyectoBase.Services.TokenService
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateUserToken(ProyectoBase.Models.Usuario usuario)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.IDUsuario.ToString()),
                new Claim(ClaimTypes.Name, usuario.Username ?? usuario.Email ?? ""),
                new Claim(ClaimTypes.Email, usuario.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (usuario.UsuarioRoles != null && usuario.UsuarioRoles.Count > 0)
            {
                foreach (var ur in usuario.UsuarioRoles)
                {
                    if (ur.Rol != null && !string.IsNullOrEmpty(ur.Rol.Codigo))
                    {
                        claims.Add(new Claim(ClaimTypes.Role, ur.Rol.Codigo));
                    }
                }
            }
            else if (!string.IsNullOrEmpty(usuario.Rol))
            {
                claims.Add(new Claim(ClaimTypes.Role, usuario.Rol));
            }

            string secretKey = _config["Jwt:Admin:Key"] ?? _config["Jwt:SecretKey"] ?? "ClaveSecretaSuperSeguraYMuyLarga12345!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int expirationHours = int.Parse(_config["Jwt:Admin:ExpirationHours"] ?? "1");

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Admin:Issuer"] ?? "ProyectoBaseServer",
                audience: _config["Jwt:Admin:Audience"] ?? "ProyectoBaseClient",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expirationHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateAdminToken(string username)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username)
            };

            string secretKey = _config["Jwt:Admin:Key"] ?? _config["Jwt:SecretKey"] ?? "ClaveSecretaSuperSeguraYMuyLarga12345!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int expirationHours = int.Parse(_config["Jwt:Admin:ExpirationHours"] ?? "1");

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Admin:Issuer"] ?? "ProyectoBaseServer",
                audience: _config["Jwt:Admin:Audience"] ?? "ProyectoBaseClient",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expirationHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
