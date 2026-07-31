using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class _007_Etapa3_Entidades_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Rol",
                table: "PB_Usuario",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "INQUILINO");

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckInFecha",
                table: "PB_Reserva",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CheckInRealizado",
                table: "PB_Reserva",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoRetenido",
                table: "PB_Reserva",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0.00m);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaNotificacion",
                table: "PB_ListaEspera",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaResolucion",
                table: "PB_ListaEspera",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IDUsuario",
                table: "PB_ListaEspera",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "MotivoExpiracion",
                table: "PB_ListaEspera",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TieneGuardiaDedicado",
                table: "PB_Consorcio",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PB_NotificacionIntento",
                columns: table => new
                {
                    IDIntento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDNotificacion = table.Column<int>(type: "integer", nullable: false),
                    Canal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EnviadoEn = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    Entregado = table.Column<bool>(type: "boolean", nullable: false),
                    EntregadoEn = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_NotificacionIntento", x => x.IDIntento);
                });

            migrationBuilder.CreateTable(
                name: "PB_PoliticaCancelacionTramo",
                columns: table => new
                {
                    IDTramo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenityConfig = table.Column<int>(type: "integer", nullable: true),
                    HorasAntesDesde = table.Column<int>(type: "integer", nullable: false),
                    HorasAntesHasta = table.Column<int>(type: "integer", nullable: false),
                    PorcentajePenalidad = table.Column<decimal>(type: "numeric(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_PoliticaCancelacionTramo", x => x.IDTramo);
                    table.ForeignKey(
                        name: "FK_PB_PoliticaCancelacionTramo_PB_AmenityConfig_IDAmenityConfig",
                        column: x => x.IDAmenityConfig,
                        principalTable: "PB_AmenityConfig",
                        principalColumn: "IDAmenityConfig",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PB_UsuarioUnidad",
                columns: table => new
                {
                    IDUsuarioUnidad = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDUsuario = table.Column<int>(type: "integer", nullable: false),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    TipoRelacion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EsOcupanteActual = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_UsuarioUnidad", x => x.IDUsuarioUnidad);
                    table.ForeignKey(
                        name: "FK_PB_UsuarioUnidad_PB_UnidadHabitacional_IDUnidadHabitacional",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PB_UsuarioUnidad_PB_Usuario_IDUsuario",
                        column: x => x.IDUsuario,
                        principalTable: "PB_Usuario",
                        principalColumn: "IDUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PB_ListaEspera_IDUsuario",
                table: "PB_ListaEspera",
                column: "IDUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_PB_PoliticaCancelacionTramo_IDAmenityConfig",
                table: "PB_PoliticaCancelacionTramo",
                column: "IDAmenityConfig");

            migrationBuilder.CreateIndex(
                name: "IX_PB_UsuarioUnidad_IDUnidadHabitacional",
                table: "PB_UsuarioUnidad",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_UsuarioUnidad_IDUsuario",
                table: "PB_UsuarioUnidad",
                column: "IDUsuario");

            migrationBuilder.AddForeignKey(
                name: "FK_PB_ListaEspera_PB_Usuario_IDUsuario",
                table: "PB_ListaEspera",
                column: "IDUsuario",
                principalTable: "PB_Usuario",
                principalColumn: "IDUsuario",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PB_ListaEspera_PB_Usuario_IDUsuario",
                table: "PB_ListaEspera");

            migrationBuilder.DropTable(
                name: "PB_NotificacionIntento");

            migrationBuilder.DropTable(
                name: "PB_PoliticaCancelacionTramo");

            migrationBuilder.DropTable(
                name: "PB_UsuarioUnidad");

            migrationBuilder.DropIndex(
                name: "IX_PB_ListaEspera_IDUsuario",
                table: "PB_ListaEspera");

            migrationBuilder.DropColumn(
                name: "Rol",
                table: "PB_Usuario");

            migrationBuilder.DropColumn(
                name: "CheckInFecha",
                table: "PB_Reserva");

            migrationBuilder.DropColumn(
                name: "CheckInRealizado",
                table: "PB_Reserva");

            migrationBuilder.DropColumn(
                name: "MontoRetenido",
                table: "PB_Reserva");

            migrationBuilder.DropColumn(
                name: "FechaNotificacion",
                table: "PB_ListaEspera");

            migrationBuilder.DropColumn(
                name: "FechaResolucion",
                table: "PB_ListaEspera");

            migrationBuilder.DropColumn(
                name: "IDUsuario",
                table: "PB_ListaEspera");

            migrationBuilder.DropColumn(
                name: "MotivoExpiracion",
                table: "PB_ListaEspera");

            migrationBuilder.DropColumn(
                name: "TieneGuardiaDedicado",
                table: "PB_Consorcio");
        }
    }
}
