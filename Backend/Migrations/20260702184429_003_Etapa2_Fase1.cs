using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class _003_Etapa2_Fase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PB_Incidencia");

            migrationBuilder.DropTable(
                name: "PB_Inquilino");

            migrationBuilder.DropTable(
                name: "PB_Invitado");

            migrationBuilder.DropTable(
                name: "PB_Reserva");

            migrationBuilder.AlterColumn<decimal>(
                name: "SaldoActual",
                table: "PB_UnidadHabitacional",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(12,2)",
                oldDefaultValue: 0.00m);

            migrationBuilder.AlterColumn<string>(
                name: "EstadoUnidad",
                table: "PB_UnidadHabitacional",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "ACTIVA",
                oldClrType: typeof(string),
                oldType: "character varying(15)",
                oldMaxLength: 15,
                oldDefaultValue: "ACTIVA");

            migrationBuilder.AlterColumn<decimal>(
                name: "Tarifa",
                table: "PB_AmenityConfig",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldDefaultValue: 0.00m);

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "HorarioInicio",
                table: "PB_AmenityConfig",
                type: "time without time zone",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "HorarioFin",
                table: "PB_AmenityConfig",
                type: "time without time zone",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "PB_Amenity",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "SaldoActual",
                table: "PB_UnidadHabitacional",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0.00m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "EstadoUnidad",
                table: "PB_UnidadHabitacional",
                type: "character varying(15)",
                maxLength: 15,
                nullable: false,
                defaultValue: "ACTIVA",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "ACTIVA");

            migrationBuilder.AlterColumn<decimal>(
                name: "Tarifa",
                table: "PB_AmenityConfig",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0.00m,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "HorarioInicio",
                table: "PB_AmenityConfig",
                type: "time",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time without time zone");

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "HorarioFin",
                table: "PB_AmenityConfig",
                type: "time",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time without time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "PB_Amenity",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateTable(
                name: "PB_Incidencia",
                columns: table => new
                {
                    IDIncidencia = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IDAmenity = table.Column<int>(type: "integer", nullable: false),
                    IDUnidadHabitacional = table.Column<int>(type: "integer", nullable: false),
                    CostoEstimado = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DetalleResolucion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
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
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
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
                    Apellido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Dni = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EstadoAcceso = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false, defaultValue: "PERMITIDO"),
                    HoraEgreso = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HoraIngreso = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
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
                    CantidadInvitados = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Estado = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUso = table.Column<DateOnly>(type: "date", nullable: false),
                    HoraFin = table.Column<TimeOnly>(type: "time", nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false)
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
        }
    }
}
