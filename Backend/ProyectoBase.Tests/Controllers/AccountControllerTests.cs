using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProyectoBase.Controllers;
using ProyectoBase.Models;
using ProyectoBase.Services.TokenService;
using Xunit;

namespace ProyectoBase.Tests.Controllers
{
    public class AccountControllerTests
    {
        private readonly Mock<ITokenService> _mockTokenService;
        private readonly AccountController _controller;

        public AccountControllerTests()
        {
            _mockTokenService = new Mock<ITokenService>();
            _controller = new AccountController(_mockTokenService.Object);
        }

        /// <summary>
        /// El login exitoso debe retornar HTTP 200 OK.
        /// </summary>
        [Fact]
        public void Login_ShouldReturn200OK()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "testuser", Password = "testpass" };
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(request.Usuario))
                .Returns("fake-jwt-token");

            // Act
            var result = _controller.Login(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>()
                .Which.StatusCode.Should().Be(200);
        }

        /// <summary>
        /// El controller debe delegar la generación del token al TokenService
        /// pasándole exactamente el usuario recibido en el request.
        /// </summary>
        [Fact]
        public void Login_ShouldCallGenerateAdminToken_WithCorrectUsername()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "sebastian", Password = "cualquier" };
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns("token");

            // Act
            _controller.Login(request);

            // Assert
            _mockTokenService.Verify(s => s.GenerateAdminToken("sebastian"), Times.Once);
        }

        /// <summary>
        /// La respuesta debe contener el token generado por el servicio.
        /// </summary>
        [Fact]
        public void Login_ResponseBody_ShouldContainTokenFromService()
        {
            // Arrange
            var expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature";
            var request = new LoginRequest { Usuario = "user", Password = "pass" };
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns(expectedToken);

            // Act
            var result = _controller.Login(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var body = okResult.Value as ServiceResponse<object>;
            body.Should().NotBeNull();
            body.Success.Should().BeTrue();
            body.ErrorMessage.Should().BeNull();
            // Verificar que el token del servicio llega al body
            var dataJson = Newtonsoft.Json.JsonConvert.SerializeObject(body.Data);
            dataJson.Should().Contain(expectedToken);
        }

        /// <summary>
        /// Estado actual: el login no valida credenciales — debe funcionar
        /// incluso con password vacío (login simple para interacción con frontend).
        /// </summary>
        [Fact]
        public void Login_WithEmptyPassword_ShouldStillReturn200()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "user", Password = "" };
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns("token");

            // Act
            var result = _controller.Login(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
        }

        /// <summary>
        /// El TokenService debe ser llamado exactamente una vez por request.
        /// </summary>
        [Fact]
        public void Login_ShouldCallTokenService_ExactlyOnce()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "u", Password = "p" };
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns("token");

            // Act
            _controller.Login(request);

            // Assert
            _mockTokenService.Verify(s => s.GenerateAdminToken(It.IsAny<string>()), Times.Once);
        }
    }
}
