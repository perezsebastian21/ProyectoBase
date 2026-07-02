using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class _004_Etapa2_Fase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PB_Inquilino",
                columns: table => new
                {
                    IDInquilino = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Apellido = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Celular = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
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
                    NombreCompleto = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FechaExpiracion = table.Column<DateOnly>(type: "date", nullable: false),
                    Patente = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_PB_Inquilino_IDUnidadHabitacional",
                table: "PB_Inquilino",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_Invitado_IDUnidadHabitacional_Dni",
                table: "PB_Invitado",
                columns: new[] { "IDUnidadHabitacional", "Dni" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_Inquilino");

            migrationBuilder.DropTable(
                name: "PB_Invitado");
        }
    }
}
