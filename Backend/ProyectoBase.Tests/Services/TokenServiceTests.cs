using FluentAssertions;
using Microsoft.Extensions.Configuration;
using ProyectoBase.Services.TokenService;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using Xunit;

namespace ProyectoBase.Tests.Services
{
    public class TokenServiceTests
    {
        private readonly TokenService _tokenService;

        public TokenServiceTests()
        {
            // Usamos ConfigurationBuilder con valores en memoria para evitar
            // depender de appsettings.json en el entorno de CI/testing.
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "Jwt:Admin:Key",             "clave-secreta-de-prueba-minimo-32-caracteres-ok" },
                    { "Jwt:Admin:Issuer",          "ProyectoBase" },
                    { "Jwt:Admin:Audience",        "ProyectoBase" },
                    { "Jwt:Admin:ExpirationHours", "1" }
                })
                .Build();

            _tokenService = new TokenService(config);
        }

        /// <summary>
        /// El token generado no debe ser nulo ni vacío.
        /// </summary>
        [Fact]
        public void GenerateAdminToken_ShouldReturnNonEmptyString()
        {
            // Act
            var token = _tokenService.GenerateAdminToken("testuser");

            // Assert
            token.Should().NotBeNullOrEmpty();
        }

        /// <summary>
        /// Un JWT siempre tiene exactamente 3 partes separadas por punto:
        /// header.payload.signature
        /// </summary>
        [Fact]
        public void GenerateAdminToken_ShouldReturnValidJwtFormat()
        {
            // Act
            var token = _tokenService.GenerateAdminToken("testuser");

            // Assert
            token.Split('.').Should().HaveCount(3,
                because: "un JWT válido siempre tiene la estructura header.payload.signature");
        }

        /// <summary>
        /// El token debe incluir el nombre de usuario en sus claims.
        /// ClaimTypes.Name se serializa como "unique_name" en el JWT.
        /// </summary>
        [Fact]
        public void GenerateAdminToken_ShouldContainUsername_InClaims()
        {
            // Arrange
            var username = "sebastian";

            // Act
            var token = _tokenService.GenerateAdminToken(username);

            // Assert: ClaimTypes.Name se serializa en el JWT como la URI completa de WS-Federation
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            // El claim type en el token es la URI completa del claim WS-Federation
            const string claimTypeUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
            var nameClaim = jwt.Claims.FirstOrDefault(c => c.Type == claimTypeUri);

            nameClaim.Should().NotBeNull(because: "el token debe contener el claim del nombre de usuario");
            nameClaim.Value.Should().Be(username);
        }

        /// <summary>
        /// El issuer del token debe coincidir con el configurado en appsettings.
        /// </summary>
        [Fact]
        public void GenerateAdminToken_ShouldHaveCorrectIssuer()
        {
            // Act
            var token = _tokenService.GenerateAdminToken("user");

            // Assert
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            jwt.Issuer.Should().Be("ProyectoBase");
        }

        /// <summary>
        /// El audience del token debe coincidir con el configurado en appsettings.
        /// </summary>
        [Fact]
        public void GenerateAdminToken_ShouldHaveCorrectAudience()
        {
            // Act
            var token = _tokenService.GenerateAdminToken("user");

            // Assert
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            jwt.Audiences.Should().Contain("ProyectoBase");
        }

        /// <summary>
        /// El token debe expirar aproximadamente en 1 hora desde su creación.
        /// </summary>
        [Fact]
        public void GenerateAdminToken_ShouldExpireInOneHour()
        {
            // Arrange
            var before = DateTime.UtcNow;

            // Act
            var token = _tokenService.GenerateAdminToken("user");
            var after = DateTime.UtcNow;

            // Assert
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            jwt.ValidTo.Should().BeAfter(before.AddMinutes(59),
                because: "el token debe expirar en aproximadamente 1 hora");
            jwt.ValidTo.Should().BeBefore(after.AddHours(1).AddMinutes(1),
                because: "el token no debe expirar en más de 1 hora");
        }

        /// <summary>
        /// Dos tokens para el mismo usuario deben decodificar al mismo username.
        /// Nota: tokens generados en el mismo segundo son idénticos por diseño
        /// (el campo exp tiene precisión de segundos en el estándar JWT).
        /// </summary>
        [Fact]
        public void GenerateAdminToken_BothTokens_ShouldContainSameUsername()
        {
            // Arrange
            const string username = "user";
            const string claimTypeUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
            var handler = new JwtSecurityTokenHandler();

            // Act
            var token1 = _tokenService.GenerateAdminToken(username);
            var token2 = _tokenService.GenerateAdminToken(username);

            // Assert: ambos tokens contienen el mismo usuario en sus claims
            var jwt1 = handler.ReadJwtToken(token1);
            var jwt2 = handler.ReadJwtToken(token2);

            jwt1.Claims.First(c => c.Type == claimTypeUri).Value.Should().Be(username);
            jwt2.Claims.First(c => c.Type == claimTypeUri).Value.Should().Be(username);
        }
    }
}
