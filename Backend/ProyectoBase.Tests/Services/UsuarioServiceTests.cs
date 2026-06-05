using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProyectoBase.Models;
using ProyectoBase.Services.UsuarioService;
using System.Threading.Tasks;
using Xunit;

namespace ProyectoBase.Tests.Services
{
    /// <summary>
    /// Tests del UsuarioService usando una base de datos en memoria (InMemory),
    /// lo que permite probar la lógica de consulta sin conexión real a PostgreSQL.
    /// </summary>
    public class UsuarioServiceTests
    {
        private ApplicationDbContext CrearContextoEnMemoria(string nombreDB)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: nombreDB)
                .Options;

            var context = new ApplicationDbContext(options);

            // Seed de datos de prueba
            context.Usuarios.AddRange(
                new Usuario { IDUsuario = 1, Username = "seba",     Password = "123", Email = "seba@test.com",     Activo = true  },
                new Usuario { IDUsuario = 2, Username = "julian",   Password = "123", Email = "julian@test.com",   Activo = true  },
                new Usuario { IDUsuario = 3, Username = "inactivo", Password = "123", Email = "inactivo@test.com", Activo = false }
            );
            context.SaveChanges();
            return context;
        }

        /// <summary>
        /// Credenciales correctas de un usuario activo → retorna el usuario.
        /// </summary>
        [Fact]
        public async Task ValidarCredenciales_UsuarioActivoYPasswordCorrecta_RetornaUsuario()
        {
            // Arrange
            using var context = CrearContextoEnMemoria("test_valido");
            var service = new UsuarioService(context);

            // Act
            var resultado = await service.ValidarCredenciales("seba", "123");

            // Assert
            resultado.Should().NotBeNull();
            resultado.Username.Should().Be("seba");
            resultado.IDUsuario.Should().Be(1);
        }

        /// <summary>
        /// Password incorrecta → retorna null.
        /// </summary>
        [Fact]
        public async Task ValidarCredenciales_PasswordIncorrecta_RetornaNull()
        {
            // Arrange
            using var context = CrearContextoEnMemoria("test_pass_incorrecta");
            var service = new UsuarioService(context);

            // Act
            var resultado = await service.ValidarCredenciales("seba", "wrong");

            // Assert
            resultado.Should().BeNull();
        }

        /// <summary>
        /// Username inexistente → retorna null.
        /// </summary>
        [Fact]
        public async Task ValidarCredenciales_UsuarioInexistente_RetornaNull()
        {
            // Arrange
            using var context = CrearContextoEnMemoria("test_user_inexistente");
            var service = new UsuarioService(context);

            // Act
            var resultado = await service.ValidarCredenciales("noexiste", "123");

            // Assert
            resultado.Should().BeNull();
        }

        /// <summary>
        /// Usuario con Activo = false → no puede iniciar sesión aunque la password sea correcta.
        /// </summary>
        [Fact]
        public async Task ValidarCredenciales_UsuarioInactivo_RetornaNull()
        {
            // Arrange
            using var context = CrearContextoEnMemoria("test_inactivo");
            var service = new UsuarioService(context);

            // Act
            var resultado = await service.ValidarCredenciales("inactivo", "123");

            // Assert
            resultado.Should().BeNull();
        }

        /// <summary>
        /// Comparación de username es case-sensitive (seba ≠ SEBA).
        /// </summary>
        [Fact]
        public async Task ValidarCredenciales_UsernameCaseDiferente_RetornaNull()
        {
            // Arrange
            using var context = CrearContextoEnMemoria("test_case_sensitive");
            var service = new UsuarioService(context);

            // Act
            var resultado = await service.ValidarCredenciales("SEBA", "123");

            // Assert
            // En memoria EF hace comparación exacta (comportamiento equivalente a Ordinal)
            resultado.Should().BeNull();
        }

        /// <summary>
        /// Segundo usuario válido también puede autenticarse correctamente.
        /// </summary>
        [Fact]
        public async Task ValidarCredenciales_SegundoUsuarioValido_RetornaUsuarioCorrecto()
        {
            // Arrange
            using var context = CrearContextoEnMemoria("test_segundo_usuario");
            var service = new UsuarioService(context);

            // Act
            var resultado = await service.ValidarCredenciales("julian", "123");

            // Assert
            resultado.Should().NotBeNull();
            resultado.Username.Should().Be("julian");
            resultado.IDUsuario.Should().Be(2);
        }
    }
}
