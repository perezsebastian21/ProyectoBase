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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
