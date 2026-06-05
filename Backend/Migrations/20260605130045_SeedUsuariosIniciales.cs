using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class SeedUsuariosIniciales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO ""PB_Usuario"" (""Username"", ""Password"", ""Email"", ""Activo"")
                SELECT 'seba', '123', 'seba@proyectobase.com', true
                WHERE NOT EXISTS (SELECT 1 FROM ""PB_Usuario"" WHERE ""Username"" = 'seba');

                INSERT INTO ""PB_Usuario"" (""Username"", ""Password"", ""Email"", ""Activo"")
                SELECT 'julian', '123', 'julian@proyectobase.com', true
                WHERE NOT EXISTS (SELECT 1 FROM ""PB_Usuario"" WHERE ""Username"" = 'julian');

                INSERT INTO ""PB_Usuario"" (""Username"", ""Password"", ""Email"", ""Activo"")
                SELECT 'juancruz', '123', 'juancruz@proyectobase.com', true
                WHERE NOT EXISTS (SELECT 1 FROM ""PB_Usuario"" WHERE ""Username"" = 'juancruz');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
