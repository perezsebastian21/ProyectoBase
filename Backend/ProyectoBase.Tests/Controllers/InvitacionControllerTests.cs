using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProyectoBase.Controllers;
using ProyectoBase.DTOs.Invitacion;
using ProyectoBase.Models;
using ProyectoBase.Services.InvitacionService;
using System;
using System.Threading.Tasks;
using Xunit;

namespace ProyectoBase.Tests.Controllers
{
    public class InvitacionControllerTests
    {
        private readonly Mock<IInvitacionService> _mockService;
        private readonly InvitacionController _controller;

        public InvitacionControllerTests()
        {
            _mockService = new Mock<IInvitacionService>();
            _controller = new InvitacionController(_mockService.Object);
        }

        [Fact]
        public async Task CrearAdmin_ShouldReturn200_WhenValid()
        {
            var dto = new CrearInvitacionAdminDto { EmailDestino = "admin@test.com" };
            var inv = new InvitacionUsuario { IDInvitacion = 1, EmailDestino = "admin@test.com", Token = "abc" };

            _mockService.Setup(s => s.CrearInvitacionAdminAsync(dto, 0)).ReturnsAsync(inv);

            var result = await _controller.CrearAdmin(dto);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task ValidarToken_ShouldReturn200_WhenValid()
        {
            var resDto = new ValidarTokenResponseDto { Token = "token123", Valido = true };
            _mockService.Setup(s => s.ValidarTokenAsync("token123")).ReturnsAsync(resDto);

            var result = await _controller.ValidarToken("token123");

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.StatusCode.Should().Be(200);
        }
    }
}
