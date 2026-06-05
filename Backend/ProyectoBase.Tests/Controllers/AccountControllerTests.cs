using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProyectoBase.Controllers;
using ProyectoBase.Models;
using ProyectoBase.Services.TokenService;
using ProyectoBase.Services.UsuarioService;
using System.Threading.Tasks;
using Xunit;

namespace ProyectoBase.Tests.Controllers
{
    public class AccountControllerLoginTests
    {
        private readonly Mock<ITokenService> _mockTokenService;
        private readonly Mock<IUsuarioService> _mockUsuarioService;
        private readonly AccountController _controller;

        private readonly Usuario _usuarioValido = new Usuario
        {
            IDUsuario = 1,
            Username = "seba",
            Password = "123",
            Email = "seba@proyectobase.com",
            Activo = true
        };

        public AccountControllerLoginTests()
        {
            _mockTokenService = new Mock<ITokenService>();
            _mockUsuarioService = new Mock<IUsuarioService>();
            _controller = new AccountController(_mockTokenService.Object, _mockUsuarioService.Object);
        }

        /// <summary>
        /// Credenciales válidas → HTTP 200 con token en el body.
        /// </summary>
        [Fact]
        public async Task Login_CredencialesValidas_DebeRetornar200ConToken()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "seba", Password = "123" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales("seba", "123"))
                .ReturnsAsync(_usuarioValido);
            _mockTokenService
                .Setup(s => s.GenerateAdminToken("seba"))
                .Returns("jwt-token-valido");

            // Act
            var result = await _controller.Login(request);

            // Assert
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.StatusCode.Should().Be(200);
            var body = ok.Value as ServiceResponse<object>;
            body.Should().NotBeNull();
            body.Success.Should().BeTrue();
        }

        /// <summary>
        /// Credenciales inválidas → HTTP 401 Unauthorized.
        /// </summary>
        [Fact]
        public async Task Login_CredencialesInvalidas_DebeRetornar401()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "seba", Password = "wrongpass" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales("seba", "wrongpass"))
                .ReturnsAsync((Usuario)null);

            // Act
            var result = await _controller.Login(request);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>()
                .Which.StatusCode.Should().Be(401);
        }

        /// <summary>
        /// Usuario inexistente → HTTP 401 Unauthorized.
        /// </summary>
        [Fact]
        public async Task Login_UsuarioInexistente_DebeRetornar401()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "noexiste", Password = "123" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales("noexiste", "123"))
                .ReturnsAsync((Usuario)null);

            // Act
            var result = await _controller.Login(request);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        /// <summary>
        /// Login exitoso → el token generado por el servicio llega al body de la respuesta.
        /// </summary>
        [Fact]
        public async Task Login_CredencialesValidas_BodyDebeContenerElToken()
        {
            // Arrange
            var expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature";
            var request = new LoginRequest { Usuario = "seba", Password = "123" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(_usuarioValido);
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns(expectedToken);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var body = ok.Value as ServiceResponse<object>;
            var dataJson = Newtonsoft.Json.JsonConvert.SerializeObject(body.Data);
            dataJson.Should().Contain(expectedToken);
        }

        /// <summary>
        /// Login exitoso → el body incluye el username del usuario autenticado.
        /// </summary>
        [Fact]
        public async Task Login_CredencialesValidas_BodyDebeContenerUsername()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "seba", Password = "123" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(_usuarioValido);
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns("token");

            // Act
            var result = await _controller.Login(request);

            // Assert
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var body = ok.Value as ServiceResponse<object>;
            var dataJson = Newtonsoft.Json.JsonConvert.SerializeObject(body.Data);
            dataJson.Should().Contain("seba");
        }

        /// <summary>
        /// Login exitoso → GenerateAdminToken se llama con el Username del usuario encontrado en BD.
        /// </summary>
        [Fact]
        public async Task Login_CredencialesValidas_DebeGenerarTokenConUsernameDeDB()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "seba", Password = "123" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales("seba", "123"))
                .ReturnsAsync(_usuarioValido);
            _mockTokenService
                .Setup(s => s.GenerateAdminToken(It.IsAny<string>()))
                .Returns("token");

            // Act
            await _controller.Login(request);

            // Assert — el token se genera con el username que viene de la BD, no del request
            _mockTokenService.Verify(s => s.GenerateAdminToken("seba"), Times.Once);
        }

        /// <summary>
        /// Credenciales inválidas → GenerateAdminToken no debe ser llamado.
        /// </summary>
        [Fact]
        public async Task Login_CredencialesInvalidas_NoDebeGenerarToken()
        {
            // Arrange
            var request = new LoginRequest { Usuario = "seba", Password = "wrong" };
            _mockUsuarioService
                .Setup(s => s.ValidarCredenciales(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((Usuario)null);

            // Act
            await _controller.Login(request);

            // Assert
            _mockTokenService.Verify(s => s.GenerateAdminToken(It.IsAny<string>()), Times.Never);
        }
    }
}
