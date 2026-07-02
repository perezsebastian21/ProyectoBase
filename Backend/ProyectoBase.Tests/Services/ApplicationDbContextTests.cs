using Microsoft.EntityFrameworkCore;
using ProyectoBase.Models;
using Xunit;

namespace ProyectoBase.Tests.Services
{
    public class ApplicationDbContextTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task CanSave_UnidadHabitacional_And_Complejo()
        {
            // Arrange
            var context = GetDbContext();
            
            var consorcio = new Consorcio { Cuit = "12345678901", Nombre = "Test Consorcio", Email = "test@consorcio.com" };
            var complejo = new Complejo { Consorcio = consorcio, Nombre = "Test Complejo", Tipo = "EDIFICIO", Direccion = "123 Calle" };
            var unidad = new UnidadHabitacional { Complejo = complejo, Identificador = "1A", EstadoUnidad = "ACTIVA" };

            // Act
            context.Consorcios.Add(consorcio);
            context.Complejos.Add(complejo);
            context.UnidadesHabitacionales.Add(unidad);
            await context.SaveChangesAsync();

            // Assert
            var savedUnidad = await context.UnidadesHabitacionales.Include(u => u.Complejo).FirstOrDefaultAsync();
            Assert.NotNull(savedUnidad);
            Assert.Equal("1A", savedUnidad.Identificador);
            Assert.Equal("Test Complejo", savedUnidad.Complejo.Nombre);
        }

        [Fact]
        public async Task CanSave_Amenity_And_AmenityConfig()
        {
            // Arrange
            var context = GetDbContext();
            
            var consorcio = new Consorcio { Cuit = "10987654321", Nombre = "Test Consorcio 2", Email = "test2@consorcio.com" };
            var complejo = new Complejo { Consorcio = consorcio, Nombre = "Test Complejo 2", Tipo = "EDIFICIO", Direccion = "456 Calle" };
            
            var amenity = new Amenity { Complejo = complejo, Nombre = "SUM", Capacidad = 50, Estado = "DISPONIBLE" };
            var config = new AmenityConfig { Amenity = amenity, HorarioInicio = new TimeOnly(10, 0), HorarioFin = new TimeOnly(22, 0), DuracionBloqueMinutos = 60, LimiteReservasMesUnidad = 4 };

            // Act
            context.Consorcios.Add(consorcio);
            context.Complejos.Add(complejo);
            context.Amenities.Add(amenity);
            context.AmenityConfigs.Add(config);
            await context.SaveChangesAsync();

            // Assert
            var savedAmenity = await context.Amenities.Include(a => a.Config).FirstOrDefaultAsync();
            Assert.NotNull(savedAmenity);
            Assert.Equal("SUM", savedAmenity.Nombre);
            Assert.NotNull(savedAmenity.Config);
            Assert.Equal(60, savedAmenity.Config.DuracionBloqueMinutos);
        }
    }
}
