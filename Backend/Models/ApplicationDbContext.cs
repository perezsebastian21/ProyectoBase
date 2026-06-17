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
