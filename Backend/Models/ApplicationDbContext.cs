using Microsoft.EntityFrameworkCore;

namespace ProyectoBase.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Persona> Personas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Consorcio> Consorcios { get; set; }
        public DbSet<Complejo> Complejos { get; set; }
        public DbSet<UnidadHabitacional> UnidadesHabitacionales { get; set; }
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<AmenityConfig> AmenityConfigs { get; set; }
        public DbSet<Inquilino> Inquilinos { get; set; }
        public DbSet<Invitado> Invitados { get; set; }
        public DbSet<Reserva> Reservas { get; set; }
        public DbSet<Incidencia> Incidencias { get; set; }
        public DbSet<ListaEspera> ListasEspera { get; set; }
        public DbSet<MantenimientoProgramado> MantenimientosProgramados { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<UsuarioUnidad> UsuariosUnidades { get; set; }
        public DbSet<PoliticaCancelacionTramo> PoliticasCancelacionTramos { get; set; }
        public DbSet<NotificacionIntento> NotificacionesIntentos { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<UsuarioRol> UsuariosRoles { get; set; }
        public DbSet<InvitacionUsuario> InvitacionesUsuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Consorcio>(entity =>
            {
                entity.ToTable("PB_Consorcio");
                entity.HasKey(x => x.IDConsorcio);
                entity.Property(x => x.Cuit).IsRequired().HasMaxLength(11);
                entity.HasIndex(x => x.Cuit).IsUnique();
                entity.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(x => x.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(x => x.Email).IsUnique();
                entity.Property(x => x.Telefono).HasMaxLength(20);
                entity.Property(x => x.TieneGuardiaDedicado).HasDefaultValue(false);
            });

            modelBuilder.Entity<Complejo>(entity =>
            {
                entity.ToTable("PB_Complejo");
                entity.HasKey(x => x.IDComplejo);
                entity.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                entity.HasIndex(x => new { x.IDConsorcio, x.Nombre }).IsUnique();
                entity.Property(x => x.Tipo).IsRequired().HasMaxLength(20);
                entity.Property(x => x.Direccion).IsRequired().HasMaxLength(200);
                entity.HasOne(x => x.Consorcio).WithMany()
                      .HasForeignKey(x => x.IDConsorcio).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UnidadHabitacional>(entity =>
            {
                entity.ToTable("PB_UnidadHabitacional");
                entity.HasKey(x => x.IDUnidadHabitacional);
                entity.Property(x => x.Identificador).IsRequired().HasMaxLength(20);
                entity.HasIndex(x => new { x.IDComplejo, x.Identificador }).IsUnique();
                entity.Property(x => x.DebeExpensas).HasDefaultValue(false);
                entity.Property(x => x.SaldoActual).HasColumnType("decimal(18,2)").HasDefaultValue(0);
                entity.Property(x => x.EstadoUnidad).IsRequired().HasMaxLength(20).HasDefaultValue("ACTIVA");
                entity.Property(x => x.ContadorInfracciones).HasDefaultValue(0);
                entity.HasOne(x => x.Complejo).WithMany().HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Amenity>(entity =>
            {
                entity.ToTable("PB_Amenity");
                entity.HasKey(x => x.IDAmenity);
                entity.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                entity.HasIndex(x => new { x.IDComplejo, x.Nombre }).IsUnique();
                entity.Property(x => x.Capacidad).IsRequired();
                entity.Property(x => x.Estado).IsRequired().HasMaxLength(20).HasDefaultValue("DISPONIBLE");
                entity.HasOne(x => x.Complejo).WithMany().HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AmenityConfig>(entity =>
            {
                entity.ToTable("PB_AmenityConfig");
                entity.HasKey(x => x.IDAmenityConfig);
                entity.Property(x => x.HorarioInicio).IsRequired();
                entity.Property(x => x.HorarioFin).IsRequired();
                entity.Property(x => x.DuracionBloqueMinutos).IsRequired();
                entity.Property(x => x.TiempoLimpiezaMinutos).HasDefaultValue(0);
                entity.Property(x => x.Tarifa).HasColumnType("decimal(18,2)").HasDefaultValue(0);
                entity.Property(x => x.LimiteReservasMesUnidad).IsRequired();
                entity.Property(x => x.RequiereAprobacion).HasDefaultValue(false);
                entity.HasOne(x => x.Amenity).WithOne(a => a.Config)
                      .HasForeignKey<AmenityConfig>(x => x.IDAmenity).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Inquilino>(entity =>
            {
                entity.ToTable("PB_Inquilino");
                entity.HasKey(x => x.IDInquilino);
                entity.Property(x => x.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(x => x.Apellido).IsRequired().HasMaxLength(150);
                entity.Property(x => x.Dni).IsRequired().HasMaxLength(20);
                entity.Property(x => x.Email).HasMaxLength(250);
                entity.Property(x => x.Celular).HasMaxLength(50);
                entity.Property(x => x.Activo).HasDefaultValue(true);
                entity.HasOne(x => x.UnidadHabitacional).WithMany()
                      .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Invitado>(entity =>
            {
                entity.ToTable("PB_Invitado");
                entity.HasKey(x => x.IDInvitado);
                entity.Property(x => x.NombreCompleto).IsRequired().HasMaxLength(200);
                entity.Property(x => x.Dni).IsRequired().HasMaxLength(20);
                entity.HasIndex(x => new { x.IDUnidadHabitacional, x.Dni }).IsUnique();
                entity.Property(x => x.FechaExpiracion).IsRequired();
                entity.Property(x => x.Patente).HasMaxLength(20);
                entity.HasOne(x => x.UnidadHabitacional).WithMany()
                      .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Reserva>(entity =>
            {
                entity.ToTable("PB_Reserva");
                entity.HasKey(x => x.IDReserva);
                entity.Property(x => x.FechaUso).IsRequired().HasColumnType("date");
                entity.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
                entity.Property(x => x.HoraFin).IsRequired().HasColumnType("time");
                entity.Property(x => x.CantidadInvitados).HasDefaultValue(0);
                entity.Property(x => x.Estado).IsRequired().HasMaxLength(25);
                entity.Property(x => x.FechaSolicitud).IsRequired().HasColumnType("timestamptz");
                entity.Property(x => x.CheckInRealizado).HasDefaultValue(false);
                entity.Property(x => x.MontoRetenido).HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
                entity.HasOne(x => x.Amenity).WithMany()
                      .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.UnidadHabitacional).WithMany()
                      .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Incidencia>(entity =>
            {
                entity.ToTable("PB_Incidencia");
                entity.HasKey(x => x.IDIncidencia);
                entity.Property(x => x.Descripcion).IsRequired().HasMaxLength(500);
                entity.Property(x => x.Estado).IsRequired().HasMaxLength(20);
                entity.Property(x => x.DetalleResolucion).HasMaxLength(500);
                entity.Property(x => x.CostoEstimado).HasColumnType("decimal(10,2)");
                entity.Property(x => x.FechaReporte).IsRequired().HasColumnType("timestamptz");
                entity.Property(x => x.FechaResolucion).HasColumnType("timestamptz");
                entity.HasOne(x => x.Amenity).WithMany()
                      .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.UnidadHabitacional).WithMany()
                      .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ListaEspera>(entity =>
            {
                entity.ToTable("PB_ListaEspera");
                entity.HasKey(x => x.IDListaEspera);
                entity.Property(x => x.FechaUso).IsRequired().HasColumnType("date");
                entity.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
                entity.Property(x => x.Posicion).IsRequired();
                entity.Property(x => x.FechaInscripcion).IsRequired().HasColumnType("timestamptz");
                entity.Property(x => x.Estado).IsRequired().HasMaxLength(15).HasDefaultValue("ESPERANDO");
                entity.Property(x => x.MotivoExpiracion).HasMaxLength(30);
                entity.HasOne(x => x.Amenity).WithMany()
                      .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.UnidadHabitacional).WithMany()
                      .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.Usuario).WithMany()
                      .HasForeignKey(x => x.IDUsuario).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<MantenimientoProgramado>(entity =>
            {
                entity.ToTable("PB_MantenimientoProgramado");
                entity.HasKey(x => x.IDMantenimiento);
                entity.Property(x => x.Descripcion).IsRequired().HasMaxLength(200);
                entity.Property(x => x.Recurrencia).IsRequired().HasMaxLength(20);
                entity.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
                entity.Property(x => x.HoraFin).IsRequired().HasColumnType("time");
                entity.Property(x => x.FechaInicio).IsRequired().HasColumnType("date");
                entity.Property(x => x.FechaFin).IsRequired().HasColumnType("date");
                entity.HasOne(x => x.Amenity).WithMany()
                      .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("PB_AuditLog");
                entity.HasKey(x => x.IDAuditLog);
                entity.Property(x => x.Usuario).IsRequired().HasMaxLength(100);
                entity.Property(x => x.Accion).IsRequired().HasMaxLength(50);
                entity.Property(x => x.Entidad).IsRequired().HasMaxLength(50);
                entity.Property(x => x.EntidadId).IsRequired();
                entity.Property(x => x.FechaHora).IsRequired().HasColumnType("timestamptz");
                entity.Property(x => x.Detalle).HasColumnType("text");
            });

            modelBuilder.Entity<Persona>(entity =>
            {
                entity.ToTable("PB_Persona");
                
                // Clave primaria
                entity.HasKey(e => e.IDPersona);
                
                // Propiedades obligatorias y longitudes máximas
                entity.Property(e => e.Nombre)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(e => e.Apellido)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(e => e.FechaNacimiento)
                      .IsRequired();

                entity.Property(e => e.Dni)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(e => e.Email)
                      .HasMaxLength(250);

                entity.Property(e => e.Celular)
                      .HasMaxLength(50);
                
                // Índices únicos
                entity.HasIndex(e => e.Dni)
                      .IsUnique();

                entity.HasIndex(e => e.Email)
                      .IsUnique();
            });

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("PB_Usuario");

                // Clave primaria
                entity.HasKey(e => e.IDUsuario);

                // Propiedades obligatorias y longitudes máximas
                entity.Property(e => e.Username)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Password)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.Property(e => e.Email)
                      .IsRequired()
                      .HasMaxLength(250);

                entity.Property(e => e.Rol)
                      .IsRequired()
                      .HasMaxLength(30)
                      .HasDefaultValue("INQUILINO");

                entity.Property(e => e.Activo)
                      .IsRequired()
                      .HasDefaultValue(true);

                // Índices únicos
                entity.HasIndex(e => e.Username)
                      .IsUnique();

                entity.HasIndex(e => e.Email)
                      .IsUnique();
            });

            modelBuilder.Entity<Rol>(entity =>
            {
                entity.ToTable("PB_Rol");
                entity.HasKey(x => x.IDRol);
                entity.Property(x => x.Codigo).IsRequired().HasMaxLength(30);
                entity.HasIndex(x => x.Codigo).IsUnique();
                entity.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(x => x.Descripcion).HasMaxLength(250);

                entity.HasData(
                    new Rol { IDRol = 1, Codigo = "SUPER_ADMINISTRADOR", Nombre = "Super Administrador", Descripcion = "Acceso total cross-tenant" },
                    new Rol { IDRol = 2, Codigo = "ADMINISTRADOR_AVANZADO", Nombre = "Administrador Avanzado", Descripcion = "Gestión completa del consorcio" },
                    new Rol { IDRol = 3, Codigo = "ADMINISTRADOR_LIVIANO", Nombre = "Administrador Liviano", Descripcion = "Operativo día a día sin guardia" },
                    new Rol { IDRol = 4, Codigo = "GUARDIA", Nombre = "Guardia / Seguridad", Descripcion = "Control de accesos y portería" },
                    new Rol { IDRol = 5, Codigo = "PROPIETARIO", Nombre = "Propietario", Descripcion = "Dueño de unidad con supervisión" },
                    new Rol { IDRol = 6, Codigo = "INQUILINO", Nombre = "Inquilino", Descripcion = "Residente operativo de unidad" },
                    new Rol { IDRol = 7, Codigo = "INVITADO", Nombre = "Invitado", Descripcion = "Acceso temporal con vigencia acotada" }
                );
            });

            modelBuilder.Entity<UsuarioRol>(entity =>
            {
                entity.ToTable("PB_UsuarioRol");
                entity.HasKey(x => x.IDUsuarioRol);
                entity.HasIndex(x => new { x.IDUsuario, x.IDRol }).IsUnique();
                entity.HasOne(x => x.Usuario)
                      .WithMany(u => u.UsuarioRoles)
                      .HasForeignKey(x => x.IDUsuario)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(x => x.Rol)
                      .WithMany()
                      .HasForeignKey(x => x.IDRol)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UsuarioUnidad>(entity =>
            {
                entity.ToTable("PB_UsuarioUnidad");
                entity.HasKey(x => x.IDUsuarioUnidad);
                entity.Property(x => x.TipoRelacion).IsRequired().HasMaxLength(20);
                entity.Property(x => x.EsOcupanteActual).HasDefaultValue(true);
                entity.Property(x => x.EstadoRelacion).IsRequired().HasMaxLength(30).HasDefaultValue("VIGENTE");
                entity.Property(x => x.MotivoRechazo).HasMaxLength(250);
                entity.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.IDUsuario).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(x => x.UnidadHabitacional).WithMany().HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<InvitacionUsuario>(entity =>
            {
                entity.ToTable("PB_InvitacionUsuario");
                entity.HasKey(x => x.IDInvitacion);
                entity.Property(x => x.EmailDestino).IsRequired().HasMaxLength(250);
                entity.Property(x => x.Token).IsRequired().HasMaxLength(100);
                entity.HasIndex(x => x.Token).IsUnique();
                entity.Property(x => x.RolDestino).IsRequired().HasMaxLength(30);
                entity.Property(x => x.Estado).IsRequired().HasMaxLength(20).HasDefaultValue("PENDIENTE");
                entity.HasOne(x => x.Consorcio).WithMany().HasForeignKey(x => x.IDConsorcio).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.Complejo).WithMany().HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.UnidadHabitacional).WithMany().HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(x => x.UsuarioCreador).WithMany().HasForeignKey(x => x.IDUsuarioCreador).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PoliticaCancelacionTramo>(entity =>
            {
                entity.ToTable("PB_PoliticaCancelacionTramo");
                entity.HasKey(x => x.IDTramo);
                entity.Property(x => x.PorcentajePenalidad).HasColumnType("decimal(5,2)");
                entity.HasOne(x => x.AmenityConfig).WithMany().HasForeignKey(x => x.IDAmenityConfig).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<NotificacionIntento>(entity =>
            {
                entity.ToTable("PB_NotificacionIntento");
                entity.HasKey(x => x.IDIntento);
                entity.Property(x => x.Canal).IsRequired().HasMaxLength(20);
                entity.Property(x => x.EnviadoEn).IsRequired().HasColumnType("timestamptz");
            });
        }
    }
}
