using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoBase.Migrations
{
    /// <inheritdoc />
    public partial class SeedConsorcioComplejoPrueba : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO ""PB_Consorcio"" (""Cuit"", ""Nombre"", ""Email"", ""Telefono"") 
                VALUES ('11111111111', 'Consorcio Alfa', 'alfa@consorcio.com', '123456') 
                ON CONFLICT (""Cuit"") DO NOTHING;

                INSERT INTO ""PB_Consorcio"" (""Cuit"", ""Nombre"", ""Email"", ""Telefono"") 
                VALUES ('22222222222', 'Consorcio Beta', 'beta@consorcio.com', '654321') 
                ON CONFLICT (""Cuit"") DO NOTHING;

                INSERT INTO ""PB_Complejo"" (""IDConsorcio"", ""Nombre"", ""Tipo"", ""Direccion"") 
                SELECT ""IDConsorcio"", 'Torre Alfa Norte', 'EDIFICIO', 'Avenida Norte 100' 
                FROM ""PB_Consorcio"" WHERE ""Cuit"" = '11111111111' 
                ON CONFLICT (""IDConsorcio"", ""Nombre"") DO NOTHING;

                INSERT INTO ""PB_Complejo"" (""IDConsorcio"", ""Nombre"", ""Tipo"", ""Direccion"") 
                SELECT ""IDConsorcio"", 'Barrio Beta Sur', 'BARRIO_PRIVADO', 'Ruta Sur 200' 
                FROM ""PB_Consorcio"" WHERE ""Cuit"" = '22222222222' 
                ON CONFLICT (""IDConsorcio"", ""Nombre"") DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
