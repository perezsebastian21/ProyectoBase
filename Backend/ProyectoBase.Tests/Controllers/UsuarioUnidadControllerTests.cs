using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProyectoBase.Controllers;
using ProyectoBase.DTOs.UsuarioUnidad;
using ProyectoBase.Models;
using ProyectoBase.Services.UsuarioUnidadService;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace ProyectoBase.Tests.Controllers
{
    public class UsuarioUnidadControllerTests
    {
        private readonly Mock<IUsuarioUnidadService> _mockService;
        private readonly UsuarioUnidadController _controller;

        public UsuarioUnidadControllerTests()
        {
            _mockService = new Mock<IUsuarioUnidadService>();
            _controller = new UsuarioUnidadController(_mockService.Object);
        }

        [Fact]
        public async Task GetPendientes_ShouldReturn200_WithList()
        {
            var lista = new List<UsuarioUnidadPendienteDto>
            {
                new UsuarioUnidadPendienteDto { IDUsuarioUnidad = 1, Username = "prop1" }
            };

            _mockService.Setup(s => s.ObtenerPendientesAsync(null)).ReturnsAsync(lista);

            var result = await _controller.GetPendientes(null);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task Aprobar_ShouldReturn200_WhenSuccess()
        {
            var uu = new UsuarioUnidad { IDUsuarioUnidad = 1, EstadoRelacion = "VIGENTE" };
            _mockService.Setup(s => s.AprobarUsuarioUnidadAsync(1)).ReturnsAsync(uu);

            var result = await _controller.Aprobar(1);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.StatusCode.Should().Be(200);
        }
    }
}
