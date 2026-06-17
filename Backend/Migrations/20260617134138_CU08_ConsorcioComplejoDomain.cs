using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class CU08_ConsorcioComplejoDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PB_Consorcio",
                columns: table => new
                {
                    IDConsorcio = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cuit = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Consorcio", x => x.IDConsorcio);
                });

            migrationBuilder.CreateTable(
                name: "PB_Complejo",
                columns: table => new
                {
                    IDComplejo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDConsorcio = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Direccion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Complejo", x => x.IDComplejo);
                    table.ForeignKey(
                        name: "FK_PB_Complejo_PB_Consorcio_IDConsorcio",
                        column: x => x.IDConsorcio,
                        principalTable: "PB_Consorcio",
                        principalColumn: "IDConsorcio",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PB_Complejo_IDConsorcio_Nombre",
                table: "PB_Complejo",
                columns: new[] { "IDConsorcio", "Nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_Consorcio_Cuit",
                table: "PB_Consorcio",
                column: "Cuit",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_Consorcio_Email",
                table: "PB_Consorcio",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_Complejo");

            migrationBuilder.DropTable(
                name: "PB_Consorcio");
        }
    }
}
