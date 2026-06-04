using Moq;
using FluentAssertions;
using Xunit;
using ProyectoBase.Services.GenericService;
using ProyectoBase.DataAccess.Interfaces;
using ProyectoBase.Models;
using ProyectoBase.Exceptions;
using System;
using System.Threading.Tasks;

namespace ProyectoBase.Tests.Services
{
    public class ServiceAsyncTests
    {
        private readonly Mock<IRepositoryAsync<Persona>> _mockRepository;
        private readonly ServiceAsync<Persona> _service;

        public ServiceAsyncTests()
        {
            _mockRepository = new Mock<IRepositoryAsync<Persona>>();
            _service = new ServiceAsync<Persona>(_mockRepository.Object);
        }

        [Fact]
        public async Task GetByID_WhenEntityExists_ShouldReturnEntity()
        {
            // Arrange
            var personaId = 1;
            var expectedPersona = new Persona 
            { 
                IDPersona = personaId, 
                Nombre = "Juan", 
                Apellido = "Perez",
                FechaNacimiento = new DateTime(1990, 5, 20),
                Dni = "12345678",
                Email = "juan.perez@example.com"
            };
            _mockRepository.Setup(r => r.GetByID(personaId)).ReturnsAsync(expectedPersona);

            // Act
            var result = await _service.GetByID(personaId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEquivalentTo(expectedPersona);
            _mockRepository.Verify(r => r.GetByID(personaId), Times.Once);
        }

        [Fact]
        public async Task GetByID_WhenEntityDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var personaId = 99;
            _mockRepository.Setup(r => r.GetByID(personaId)).ReturnsAsync((Persona)null);

            // Act
            Func<Task> act = async () => await _service.GetByID(personaId);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage($"Registro con ID {personaId} no encontrado en Persona.");
        }
    }
}
