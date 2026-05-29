using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PB_Persona",
                columns: table => new
                {
                    IDPersona = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Apellido = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    FechaNacimiento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Celular = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Persona", x => x.IDPersona);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PB_Persona_Dni",
                table: "PB_Persona",
                column: "Dni",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_Persona_Email",
                table: "PB_Persona",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_Persona");
        }
    }
}
