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

            modelBuilder.Entity<UnidadHabitacional>(e => {
                e.ToTable("PB_UnidadHabitacional");
                e.HasKey(x => x.IDUnidadHabitacional);
                e.Property(x => x.Identificador).IsRequired().HasMaxLength(20);
                e.HasIndex(x => new { x.IDComplejo, x.Identificador }).IsUnique();
                e.Property(x => x.DebeExpensas).HasDefaultValue(false);
                e.Property(x => x.SaldoActual).HasColumnType("decimal(12,2)").HasDefaultValue(0.00m);
                e.Property(x => x.EstadoUnidad).IsRequired().HasMaxLength(15).HasDefaultValue("ACTIVA");
                e.Property(x => x.ContadorInfracciones).HasDefaultValue(0);
                e.HasOne(x => x.Complejo).WithMany()
                 .HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Amenity>(e => {
                e.ToTable("PB_Amenity");
                e.HasKey(x => x.IDAmenity);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(50);
                e.HasIndex(x => new { x.IDComplejo, x.Nombre }).IsUnique();
                e.Property(x => x.Capacidad).IsRequired();
                e.Property(x => x.Estado).IsRequired().HasMaxLength(20).HasDefaultValue("DISPONIBLE");
                e.HasOne(x => x.Complejo).WithMany()
                 .HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AmenityConfig>(e => {
                e.ToTable("PB_AmenityConfig");
                e.HasKey(x => x.IDAmenityConfig);
                e.HasIndex(x => x.IDAmenity).IsUnique();
                e.Property(x => x.HorarioInicio).IsRequired().HasColumnType("time");
                e.Property(x => x.HorarioFin).IsRequired().HasColumnType("time");
                e.Property(x => x.DuracionBloqueMinutos).IsRequired();
                e.Property(x => x.TiempoLimpiezaMinutos).HasDefaultValue(0);
                e.Property(x => x.Tarifa).HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
                e.Property(x => x.LimiteReservasMesUnidad).IsRequired();
                e.Property(x => x.RequiereAprobacion).HasDefaultValue(false);
                e.HasOne(x => x.Amenity).WithOne(x => x.Config)
                 .HasForeignKey<AmenityConfig>(x => x.IDAmenity).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Inquilino>(e => {
                e.ToTable("PB_Inquilino");
                e.HasKey(x => x.IDInquilino);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                e.Property(x => x.Apellido).IsRequired().HasMaxLength(100);
                e.Property(x => x.Dni).IsRequired().HasMaxLength(20);
                e.HasIndex(x => x.Dni).IsUnique();
                e.Property(x => x.Telefono).HasMaxLength(20);
                e.Property(x => x.Activo).HasDefaultValue(true);
                e.HasOne(x => x.UnidadHabitacional).WithMany()
                 .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Invitado>(e => {
                e.ToTable("PB_Invitado");
                e.HasKey(x => x.IDInvitado);
                e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
                e.Property(x => x.Apellido).IsRequired().HasMaxLength(100);
                e.Property(x => x.Dni).IsRequired().HasMaxLength(20);
                e.Property(x => x.EstadoAcceso).IsRequired().HasMaxLength(15).HasDefaultValue("PERMITIDO");
                e.Property(x => x.HoraIngreso).HasColumnType("timestamp with time zone");
                e.Property(x => x.HoraEgreso).HasColumnType("timestamp with time zone");
                e.HasOne(x => x.UnidadHabitacional).WithMany()
                 .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Reserva>(e => {
                e.ToTable("PB_Reserva");
                e.HasKey(x => x.IDReserva);
                e.Property(x => x.FechaUso).IsRequired().HasColumnType("date");
                e.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
                e.Property(x => x.HoraFin).IsRequired().HasColumnType("time");
                e.Property(x => x.CantidadInvitados).HasDefaultValue(0);
                e.Property(x => x.Estado).IsRequired().HasMaxLength(25);
                e.Property(x => x.FechaSolicitud).IsRequired().HasColumnType("timestamp with time zone");
                e.HasOne(x => x.Amenity).WithMany()
                 .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.UnidadHabitacional).WithMany()
                 .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Incidencia>(e => {
                e.ToTable("PB_Incidencia");
                e.HasKey(x => x.IDIncidencia);
                e.Property(x => x.Descripcion).IsRequired().HasMaxLength(500);
                e.Property(x => x.Estado).IsRequired().HasMaxLength(20);
                e.Property(x => x.DetalleResolucion).HasMaxLength(500);
                e.Property(x => x.CostoEstimado).HasColumnType("decimal(10,2)");
                e.Property(x => x.FechaReporte).IsRequired().HasColumnType("timestamp with time zone");
                e.Property(x => x.FechaResolucion).HasColumnType("timestamp with time zone");
                e.HasOne(x => x.Amenity).WithMany()
                 .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.UnidadHabitacional).WithMany()
                 .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
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

                entity.Property(e => e.Activo)
                      .IsRequired()
                      .HasDefaultValue(true);

                // Índices únicos
                entity.HasIndex(e => e.Username)
                      .IsUnique();

                entity.HasIndex(e => e.Email)
                      .IsUnique();

            });
        }
    }
}
