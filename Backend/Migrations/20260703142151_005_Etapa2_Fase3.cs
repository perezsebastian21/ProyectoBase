using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class _005_Etapa2_Fase3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                    FechaReporte = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    FechaResolucion = table.Column<DateTime>(type: "timestamptz", nullable: true)
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
                name: "PB_ListaEspera",
                columns: table => new
                {
                    IDListaEspera = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenity = table.Column<int>(type: "integer", nullable: false),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    FechaUso = table.Column<DateOnly>(type: "date", nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    Posicion = table.Column<int>(type: "integer", nullable: false),
                    FechaInscripcion = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    Estado = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false, defaultValue: "ESPERANDO")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_ListaEspera", x => x.IDListaEspera);
                    table.ForeignKey(
                        name: "FK_PB_ListaEspera_PB_Amenity_IDAmenity",
                        column: x => x.IDAmenity,
                        principalTable: "PB_Amenity",
                        principalColumn: "IDAmenity",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PB_ListaEspera_PB_UnidadHabitacional_IDUnidadHabitacional",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PB_MantenimientoProgramado",
                columns: table => new
                {
                    IDMantenimiento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenity = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Recurrencia = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeOnly>(type: "time", nullable: false),
                    FechaInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaFin = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_MantenimientoProgramado", x => x.IDMantenimiento);
                    table.ForeignKey(
                        name: "FK_PB_MantenimientoProgramado_PB_Amenity_IDAmenity",
                        column: x => x.IDAmenity,
                        principalTable: "PB_Amenity",
                        principalColumn: "IDAmenity",
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
                    FechaSolicitud = table.Column<DateTime>(type: "timestamptz", nullable: false)
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
                name: "IX_PB_Incidencia_IDAmenity",
                table: "PB_Incidencia",
                column: "IDAmenity");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Incidencia_IDUnidadHabitacional",
                table: "PB_Incidencia",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_ListaEspera_IDAmenity",
                table: "PB_ListaEspera",
                column: "IDAmenity");

            migrationBuilder.CreateIndex(
                name: "IX_PB_ListaEspera_IDUnidadHabitacional",
                table: "PB_ListaEspera",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_MantenimientoProgramado_IDAmenity",
                table: "PB_MantenimientoProgramado",
                column: "IDAmenity");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Reserva_IDAmenity",
                table: "PB_Reserva",
                column: "IDAmenity");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Reserva_IDUnidadHabitacional",
                table: "PB_Reserva",
                column: "IDUnidadHabitacional");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_Incidencia");

            migrationBuilder.DropTable(
                name: "PB_ListaEspera");

            migrationBuilder.DropTable(
                name: "PB_MantenimientoProgramado");

            migrationBuilder.DropTable(
                name: "PB_Reserva");
        }
    }
}
