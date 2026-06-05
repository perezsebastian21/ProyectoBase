using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProyectoBase.Controllers;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;
using Xunit;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProyectoBase.Tests.Controllers
{
    public class UsuarioControllerTests
    {
        private readonly Mock<IServiceAsync<Usuario>> _mockService;
        private readonly UsuarioController _controller;

        private readonly Usuario _usuarioEjemplo = new Usuario
        {
            IDUsuario = 1,
            Username = "jperez",
            Password = "hashedpass123",
            Email = "juan.perez@example.com",
            Activo = true
        };

        public UsuarioControllerTests()
        {
            _mockService = new Mock<IServiceAsync<Usuario>>();
            _controller = new UsuarioController(_mockService.Object);
        }

        /// <summary>
        /// GetAll debe retornar HTTP 200 con una lista de usuarios.
        /// </summary>
        [Fact]
        public async Task GetAll_ShouldReturn200_WithListOfUsuarios()
        {
            // Arrange
            var lista = new List<Usuario> { _usuarioEjemplo };
            _mockService.Setup(s => s.GetAll()).ReturnsAsync(lista);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            ok.StatusCode.Should().Be(200);
            var body = ok.Value as ServiceResponse<IEnumerable<Usuario>>;
            body.Should().NotBeNull();
            body.Success.Should().BeTrue();
        }

        /// <summary>
        /// GetById debe retornar HTTP 200 con el usuario correcto.
        /// </summary>
        [Fact]
        public async Task GetById_ShouldReturn200_WithUsuario()
        {
            // Arrange
            _mockService.Setup(s => s.GetByID(1)).ReturnsAsync(_usuarioEjemplo);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var body = ok.Value as ServiceResponse<Usuario>;
            body.Should().NotBeNull();
            body.Data.IDUsuario.Should().Be(1);
            body.Data.Username.Should().Be("jperez");
        }

        /// <summary>
        /// Create debe retornar HTTP 200 con el usuario creado.
        /// </summary>
        [Fact]
        public async Task Create_ShouldReturn200_WithNewUsuario()
        {
            // Arrange
            var nuevo = new Usuario
            {
                Username = "nuevo_user",
                Password = "pass123",
                Email = "nuevo@example.com"
            };
            var creado = new Usuario
            {
                IDUsuario = 2,
                Username = "nuevo_user",
                Password = "pass123",
                Email = "nuevo@example.com",
                Activo = true
            };
            _mockService.Setup(s => s.Create(nuevo)).ReturnsAsync(creado);

            // Act
            var result = await _controller.Create(nuevo);

            // Assert
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var body = ok.Value as ServiceResponse<Usuario>;
            body.Should().NotBeNull();
            body.Data.IDUsuario.Should().Be(2);
            body.Data.Username.Should().Be("nuevo_user");
        }

        /// <summary>
        /// Update debe retornar HTTP 200 con el usuario actualizado.
        /// </summary>
        [Fact]
        public async Task Update_ShouldReturn200_WithUpdatedUsuario()
        {
            // Arrange
            var actualizado = new Usuario
            {
                IDUsuario = 1,
                Username = "jperez_mod",
                Password = "newpass",
                Email = "jperez_mod@example.com",
                Activo = true
            };
            _mockService.Setup(s => s.Update(actualizado)).ReturnsAsync(actualizado);

            // Act
            var result = await _controller.Update(actualizado);

            // Assert
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var body = ok.Value as ServiceResponse<Usuario>;
            body.Should().NotBeNull();
            body.Data.Username.Should().Be("jperez_mod");
        }

        /// <summary>
        /// Delete debe retornar HTTP 200 con data null.
        /// </summary>
        [Fact]
        public async Task Delete_ShouldReturn200_WithNullData()
        {
            // Arrange
            _mockService.Setup(s => s.Delete(1)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var body = ok.Value as ServiceResponse<object>;
            body.Should().NotBeNull();
            body.Data.Should().BeNull();
            body.Success.Should().BeTrue();
        }

        /// <summary>
        /// GetAll debe llamar al servicio exactamente una vez.
        /// </summary>
        [Fact]
        public async Task GetAll_ShouldCallService_ExactlyOnce()
        {
            // Arrange
            _mockService.Setup(s => s.GetAll()).ReturnsAsync(new List<Usuario>());

            // Act
            await _controller.GetAll();

            // Assert
            _mockService.Verify(s => s.GetAll(), Times.Once);
        }
    }
}
