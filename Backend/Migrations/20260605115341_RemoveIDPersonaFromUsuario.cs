using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIDPersonaFromUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PB_Usuario_PB_Persona_IDPersona",
                table: "PB_Usuario");

            migrationBuilder.DropIndex(
                name: "IX_PB_Usuario_IDPersona",
                table: "PB_Usuario");

            migrationBuilder.DropColumn(
                name: "IDPersona",
                table: "PB_Usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IDPersona",
                table: "PB_Usuario",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PB_Usuario_IDPersona",
                table: "PB_Usuario",
                column: "IDPersona");

            migrationBuilder.AddForeignKey(
                name: "FK_PB_Usuario_PB_Persona_IDPersona",
                table: "PB_Usuario",
                column: "IDPersona",
                principalTable: "PB_Persona",
                principalColumn: "IDPersona",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
