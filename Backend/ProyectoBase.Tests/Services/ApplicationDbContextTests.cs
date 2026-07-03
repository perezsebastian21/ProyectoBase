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
        [Fact]
        public async Task CanSave_Inquilino_And_Invitado()
        {
            // Arrange
            var context = GetDbContext();
            
            var consorcio = new Consorcio { Cuit = "33333333333", Nombre = "Test Consorcio 3", Email = "test3@consorcio.com" };
            var complejo = new Complejo { Consorcio = consorcio, Nombre = "Test Complejo 3", Tipo = "EDIFICIO", Direccion = "789 Calle" };
            var unidad = new UnidadHabitacional { Complejo = complejo, Identificador = "2B", EstadoUnidad = "ACTIVA" };
            
            var inquilino = new Inquilino { UnidadHabitacional = unidad, Nombre = "Juan", Apellido = "Perez", Dni = "12345678", Email = "juan@test.com" };
            var invitado = new Invitado { UnidadHabitacional = unidad, NombreCompleto = "Pedro Gomez", Dni = "87654321", FechaExpiracion = new DateOnly(2027, 1, 1) };

            // Act
            context.Consorcios.Add(consorcio);
            context.Complejos.Add(complejo);
            context.UnidadesHabitacionales.Add(unidad);
            context.Inquilinos.Add(inquilino);
            context.Invitados.Add(invitado);
            await context.SaveChangesAsync();

            // Assert
            var savedInquilino = await context.Inquilinos.FirstOrDefaultAsync();
            var savedInvitado = await context.Invitados.FirstOrDefaultAsync();
            
            Assert.NotNull(savedInquilino);
            Assert.Equal("Juan", savedInquilino.Nombre);
            Assert.NotNull(savedInvitado);
            Assert.Equal("Pedro Gomez", savedInvitado.NombreCompleto);
        }
        [Fact]
        public async Task CanSave_TransactionalEntities_Reserva_Incidencia_Lista_Mantenimiento()
        {
            // Arrange
            var context = GetDbContext();
            
            var consorcio = new Consorcio { Cuit = "44444444444", Nombre = "Test Consorcio 4", Email = "test4@consorcio.com" };
            var complejo = new Complejo { Consorcio = consorcio, Nombre = "Test Complejo 4", Tipo = "EDIFICIO", Direccion = "1011 Calle" };
            var unidad = new UnidadHabitacional { Complejo = complejo, Identificador = "3C", EstadoUnidad = "ACTIVA" };
            var amenity = new Amenity { Complejo = complejo, Nombre = "Quincho", Capacidad = 20, Estado = "DISPONIBLE" };
            
            var reserva = new Reserva { Amenity = amenity, UnidadHabitacional = unidad, FechaUso = new DateOnly(2026, 10, 10), HoraInicio = new TimeOnly(12, 0), HoraFin = new TimeOnly(14, 0), Estado = "CONFIRMADA", FechaSolicitud = DateTime.UtcNow };
            var incidencia = new Incidencia { Amenity = amenity, UnidadHabitacional = unidad, Descripcion = "Foco roto", Estado = "ABIERTA", FechaReporte = DateTime.UtcNow };
            var listaEspera = new ListaEspera { Amenity = amenity, UnidadHabitacional = unidad, FechaUso = new DateOnly(2026, 10, 10), HoraInicio = new TimeOnly(12, 0), Posicion = 1, FechaInscripcion = DateTime.UtcNow, Estado = "ESPERANDO" };
            var mantenimiento = new MantenimientoProgramado { Amenity = amenity, Descripcion = "Pintura", Recurrencia = "SEMANAL", HoraInicio = new TimeOnly(8, 0), HoraFin = new TimeOnly(12, 0), FechaInicio = new DateOnly(2026, 11, 1), FechaFin = new DateOnly(2026, 11, 30) };

            // Act
            context.Consorcios.Add(consorcio);
            context.Complejos.Add(complejo);
            context.UnidadesHabitacionales.Add(unidad);
            context.Amenities.Add(amenity);
            
            context.Reservas.Add(reserva);
            context.Incidencias.Add(incidencia);
            context.ListasEspera.Add(listaEspera);
            context.MantenimientosProgramados.Add(mantenimiento);
            
            await context.SaveChangesAsync();

            // Assert
            var savedReserva = await context.Reservas.FirstOrDefaultAsync();
            var savedIncidencia = await context.Incidencias.FirstOrDefaultAsync();
            
            Assert.NotNull(savedReserva);
            Assert.Equal("CONFIRMADA", savedReserva.Estado);
            Assert.NotNull(savedIncidencia);
            Assert.Equal("Foco roto", savedIncidencia.Descripcion);
        }
        [Fact]
        public async Task CanSave_AuditLog()
        {
            // Arrange
            var context = GetDbContext();
            
            var auditLog = new AuditLog { Usuario = "admin@test.com", Accion = "CREAR_RESERVA", Entidad = "Reserva", EntidadId = 99, FechaHora = DateTime.UtcNow, Detalle = "{ \"id\": 99 }" };

            // Act
            context.AuditLogs.Add(auditLog);
            await context.SaveChangesAsync();

            // Assert
            var savedLog = await context.AuditLogs.FirstOrDefaultAsync();
            
            Assert.NotNull(savedLog);
            Assert.Equal("admin@test.com", savedLog.Usuario);
            Assert.Equal("CREAR_RESERVA", savedLog.Accion);
        }
    }
}
