using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiRolEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PB_Rol",
                columns: table => new
                {
                    IDRol = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_Rol", x => x.IDRol);
                });

            migrationBuilder.CreateTable(
                name: "PB_UsuarioRol",
                columns: table => new
                {
                    IDUsuarioRol = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDUsuario = table.Column<int>(type: "integer", nullable: false),
                    IDRol = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_UsuarioRol", x => x.IDUsuarioRol);
                    table.ForeignKey(
                        name: "FK_PB_UsuarioRol_PB_Rol_IDRol",
                        column: x => x.IDRol,
                        principalTable: "PB_Rol",
                        principalColumn: "IDRol",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PB_UsuarioRol_PB_Usuario_IDUsuario",
                        column: x => x.IDUsuario,
                        principalTable: "PB_Usuario",
                        principalColumn: "IDUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "PB_Rol",
                columns: new[] { "IDRol", "Codigo", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, "SUPER_ADMINISTRADOR", "Acceso total cross-tenant", "Super Administrador" },
                    { 2, "ADMINISTRADOR_AVANZADO", "Gestión completa del consorcio", "Administrador Avanzado" },
                    { 3, "ADMINISTRADOR_LIVIANO", "Operativo día a día sin guardia", "Administrador Liviano" },
                    { 4, "GUARDIA", "Control de accesos y portería", "Guardia / Seguridad" },
                    { 5, "PROPIETARIO", "Dueño de unidad con supervisión", "Propietario" },
                    { 6, "INQUILINO", "Residente operativo de unidad", "Inquilino" },
                    { 7, "INVITADO", "Acceso temporal con vigencia acotada", "Invitado" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PB_Rol_Codigo",
                table: "PB_Rol",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PB_UsuarioRol_IDRol",
                table: "PB_UsuarioRol",
                column: "IDRol");

            migrationBuilder.CreateIndex(
                name: "IX_PB_UsuarioRol_IDUsuario_IDRol",
                table: "PB_UsuarioRol",
                columns: new[] { "IDUsuario", "IDRol" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_UsuarioRol");

            migrationBuilder.DropTable(
                name: "PB_Rol");
        }
    }
}
