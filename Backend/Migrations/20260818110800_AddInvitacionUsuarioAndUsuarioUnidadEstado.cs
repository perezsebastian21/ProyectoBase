using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitacionUsuarioAndUsuarioUnidadEstado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EstadoRelacion",
                table: "PB_UsuarioUnidad",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "VIGENTE");

            migrationBuilder.AddColumn<string>(
                name: "MotivoRechazo",
                table: "PB_UsuarioUnidad",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PB_InvitacionUsuario",
                columns: table => new
                {
                    IDInvitacion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDConsorcio = table.Column<int>(type: "integer", nullable: true),
                    IDComplejo = table.Column<int>(type: "integer", nullable: true),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: true),
                    EmailDestino = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    TelefonoDestino = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Token = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RolDestino = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDIENTE"),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FechaExpiracion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FechaAceptacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IDUsuarioCreador = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PB_InvitacionUsuario", x => x.IDInvitacion);
                    table.ForeignKey(
                        name: "FK_PB_InvitacionUsuario_PB_Complejo_IDComplejo",
                        column: x => x.IDComplejo,
                        principalTable: "PB_Complejo",
                        principalColumn: "IDComplejo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PB_InvitacionUsuario_PB_Consorcio_IDConsorcio",
                        column: x => x.IDConsorcio,
                        principalTable: "PB_Consorcio",
                        principalColumn: "IDConsorcio",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PB_InvitacionUsuario_PB_UnidadHabitacional_IDUnidadHabitaci~",
                        column: x => x.IDUnidadHabitacional,
                        principalTable: "PB_UnidadHabitacional",
                        principalColumn: "IDUnidadHabitacional",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PB_InvitacionUsuario_PB_Usuario_IDUsuarioCreador",
                        column: x => x.IDUsuarioCreador,
                        principalTable: "PB_Usuario",
                        principalColumn: "IDUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PB_InvitacionUsuario_IDComplejo",
                table: "PB_InvitacionUsuario",
                column: "IDComplejo");

            migrationBuilder.CreateIndex(
                name: "IX_PB_InvitacionUsuario_IDConsorcio",
                table: "PB_InvitacionUsuario",
                column: "IDConsorcio");

            migrationBuilder.CreateIndex(
                name: "IX_PB_InvitacionUsuario_IDUnidadHabitacional",
                table: "PB_InvitacionUsuario",
                column: "IDUnidadHabitacional");

            migrationBuilder.CreateIndex(
                name: "IX_PB_InvitacionUsuario_IDUsuarioCreador",
                table: "PB_InvitacionUsuario",
                column: "IDUsuarioCreador");

            migrationBuilder.CreateIndex(
                name: "IX_PB_InvitacionUsuario_Token",
                table: "PB_InvitacionUsuario",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_InvitacionUsuario");

            migrationBuilder.DropColumn(
                name: "EstadoRelacion",
                table: "PB_UsuarioUnidad");

            migrationBuilder.DropColumn(
                name: "MotivoRechazo",
                table: "PB_UsuarioUnidad");
        }
    }
}
