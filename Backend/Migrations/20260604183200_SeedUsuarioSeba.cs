using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class SeedUsuarioSeba : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Inserta el usuario 'seba' usando el IDPersona de la primera persona existente.
            // Si no existe ninguna persona, el INSERT no se ejecuta (subquery retorna null).
            migrationBuilder.Sql(@"
                INSERT INTO ""PB_Usuario"" (""Username"", ""Password"", ""Email"", ""Activo"", ""IDPersona"")
                SELECT 'seba', '123', 'seba@proyectobase.com', true, (SELECT ""IDPersona"" FROM ""PB_Persona"" ORDER BY ""IDPersona"" LIMIT 1)
                WHERE EXISTS (SELECT 1 FROM ""PB_Persona"")
                  AND NOT EXISTS (SELECT 1 FROM ""PB_Usuario"" WHERE ""Username"" = 'seba');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""PB_Usuario"" WHERE ""Username"" = 'seba';");
        }
    }
}
