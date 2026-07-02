using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class Etapa2_Entidades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PB_Amenity",
                columns: table => new
                {
                    IDAmenity = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDComplejo = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Capacidad = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "DISPONIBLE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Amenity", x => x.IDAmenity);
                    table.ForeignKey(
                        name: "FK_PB_Amenity_PB_Complejo_IDComplejo",
                        column: x => x.IDComplejo,
                        principalTable: "PB_Complejo",
                        principalColumn: "IDComplejo",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PB_UnidadHabitacional",
                columns: table => new
                {
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDComplejo = table.Column<int>(type: "integer", nullable: false),
                    Identificador = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DebeExpensas = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SaldoActual = table.Column<decimal>(type: "numeric(12,2)", nullable: false, defaultValue: 0.00m),
                    EstadoUnidad = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false, defaultValue: "ACTIVA"),
                    ContadorInfracciones = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_UnidadHabitacional", x => x.IDUnidadHabitacional);
                    table.ForeignKey(
                        name: "FK_PB_UnidadHabitacional_PB_Complejo_IDComplejo",
                        column: x => x.IDComplejo,
                        principalTable: "PB_Complejo",
                        principalColumn: "IDComplejo",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PB_AmenityConfig",
                columns: table => new
                {
                    IDAmenityConfig = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenity = table.Column<int>(type: "integer", nullable: false),
                    HorarioInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    HorarioFin = table.Column<TimeOnly>(type: "time", nullable: false),
                    DuracionBloqueMinutos = table.Column<int>(type: "integer", nullable: false),
                    TiempoLimpiezaMinutos = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Tarifa = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0.00m),
                    LimiteReservasMesUnidad = table.Column<int>(type: "integer", nullable: false),
                    RequiereAprobacion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_AmenityConfig", x => x.IDAmenityConfig);
                    table.ForeignKey(
                        name: "FK_PB_AmenityConfig_PB_Amenity_IDAmenity",
                        column: x => x.IDAmenity,
                        principalTable: "PB_Amenity",
                        principalColumn: "IDAmenity",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PB_Incidencia",
                columns: table => new
                {
                    IDIncidencia = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenity = table.Column<int>(type: "integer", nullable: false),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DetalleResolucion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CostoEstimado = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    FechaReporte = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaResolucion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Incidencia", x => x.IDIncidencia);
                    table.ForeignKey(
                        name: "FK_PB_Incidencia_PB_Amenity_IDAmenity",
                        column: x => x.IDAmenity,
                        principalTable: "PB_Amenity",
                        principalColumn: "IDAmenity",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PB_Incidencia_PB_UnidadHabitacional_IDUnidadHabitacional",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PB_Inquilino",
                columns: table => new
                {
                    IDInquilino = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Telefono = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Inquilino", x => x.IDInquilino);
                    table.ForeignKey(
                        name: "FK_PB_Inquilino_PB_UnidadHabitacional_IDUnidadHabitacional",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PB_Invitado",
                columns: table => new
                {
                    IDInvitado = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EstadoAcceso = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false, defaultValue: "PERMITIDO"),
                    HoraIngreso = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HoraEgreso = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Invitado", x => x.IDInvitado);
                    table.ForeignKey(
                        name: "FK_PB_Invitado_PB_UnidadHabitacional_IDUnidadHabitacional",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PB_Reserva",
                columns: table => new
                {
                    IDReserva = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenity = table.Column<int>(type: "integer", nullable: false),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    FechaUso = table.Column<DateOnly>(type: "date", nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeOnly>(type: "time", nullable: false),
                    CantidadInvitados = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Estado = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Reserva", x => x.IDReserva);
                    table.ForeignKey(
                        name: "FK_PB_Reserva_PB_Amenity_IDAmenity",
                        column: x => x.IDAmenity,
                        principalTable: "PB_Amenity",
                        principalColumn: "IDAmenity",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PB_Reserva_PB_UnidadHabitacional_IDUnidadHabitacional",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PB_Amenity_IDComplejo_Nombre",
                table: "PB_Amenity",
                columns: new[] { "IDComplejo", "Nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_AmenityConfig_IDAmenity",
                table: "PB_AmenityConfig",
                column: "IDAmenity",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_Incidencia_IDAmenity",
                table: "PB_Incidencia",
                column: "IDAmenity");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Incidencia_IDUnidadHabitacional",
                table: "PB_Incidencia",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Inquilino_Dni",
                table: "PB_Inquilino",
                column: "Dni",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_Inquilino_IDUnidadHabitacional",
                table: "PB_Inquilino",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Invitado_IDUnidadHabitacional",
                table: "PB_Invitado",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Reserva_IDAmenity",
                table: "PB_Reserva",
                column: "IDAmenity");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Reserva_IDUnidadHabitacional",
                table: "PB_Reserva",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_UnidadHabitacional_IDComplejo_Identificador",
                table: "PB_UnidadHabitacional",
                columns: new[] { "IDComplejo", "Identificador" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_AmenityConfig");

            migrationBuilder.DropTable(
                name: "PB_Incidencia");

            migrationBuilder.DropTable(
                name: "PB_Inquilino");

            migrationBuilder.DropTable(
                name: "PB_Invitado");

            migrationBuilder.DropTable(
                name: "PB_Reserva");

            migrationBuilder.DropTable(
                name: "PB_Amenity");

            migrationBuilder.DropTable(
                name: "PB_UnidadHabitacional");
        }
    }
}
