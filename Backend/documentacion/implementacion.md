# Documento de Implementación — ProyectoBase

Este archivo registra de forma cronológica los pasos de implementación realizados sobre el proyecto.

---

## [2026-06-04] Entidad `Usuario`

### Descripción
Se incorpora la entidad `Usuario` para gestionar los usuarios del sistema, con relación a la entidad `Persona` ya existente.

### Archivos creados

| Archivo | Descripción |
|---|---|
| `Backend/Models/Usuario.cs` | Clase de entidad con propiedades: `IDUsuario`, `Username`, `Password`, `Email`, `Activo`, `IDPersona` + nav. `Persona` |
| `Backend/Controllers/UsuarioController.cs` | Controlador que hereda `GenericControllerAsync<Usuario>`, expone CRUD completo automáticamente |
| `Backend/ProyectoBase.Tests/Controllers/UsuarioControllerTests.cs` | Tests unitarios del controlador con Moq + FluentAssertions |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `Backend/Models/ApplicationDbContext.cs` | Se agregó `DbSet<Usuario> Usuarios` y la configuración Fluent API de la entidad en `OnModelCreating` |

### Modelo de datos

```csharp
public class Usuario
{
    public int IDUsuario { get; set; }
    public string Username { get; set; }    // Único, máx 100 chars
    public string Password { get; set; }    // Máx 255 chars
    public string Email { get; set; }       // Único, máx 250 chars
    public bool Activo { get; set; }        // Default: true
    public int IDPersona { get; set; }      // FK → PB_Persona
    public Persona Persona { get; set; }    // Propiedad de navegación
}
```

### Tabla generada en BD

- **Nombre:** `PB_Usuario`
- **PK:** `IDUsuario`
- **Índices únicos:** `Username`, `Email`
- **FK:** `IDPersona → PB_Persona.IDPersona` (ON DELETE RESTRICT)

### Endpoints expuestos (vía GenericControllerAsync)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/Usuario/GetAll` | Lista todos los usuarios |
| `GET` | `/Usuario/GetById?id={id}` | Obtiene un usuario por ID |
| `GET` | `/Usuario/FindQP` | Búsqueda paginada con QueryParams |
| `POST` | `/Usuario` | Crea un nuevo usuario |
| `PUT` | `/Usuario` | Actualiza un usuario existente |
| `DELETE` | `/Usuario/{id}` | Elimina un usuario por ID |

### Tests unitarios agregados

Archivo: `ProyectoBase.Tests/Controllers/UsuarioControllerTests.cs`

| Test | Descripción |
|---|---|
| `GetAll_ShouldReturn200_WithListOfUsuarios` | Verifica respuesta HTTP 200 con lista |
| `GetById_ShouldReturn200_WithUsuario` | Verifica respuesta HTTP 200 con entidad correcta |
| `Create_ShouldReturn200_WithNewUsuario` | Verifica creación exitosa |
| `Update_ShouldReturn200_WithUpdatedUsuario` | Verifica actualización exitosa |
| `Delete_ShouldReturn200_WithNullData` | Verifica eliminación con `data: null` |
| `GetAll_ShouldCallService_ExactlyOnce` | Verifica que el servicio se llama exactamente una vez |

### Migración de base de datos

Luego de esta implementación se debe ejecutar:

```bash
dotnet ef migrations add AddUsuarioEntity --project Backend/ProyectoBase.csproj
```

La migración se aplica automáticamente al iniciar la app (ver `Program.cs` → `db.Database.Migrate()`).

---

> _Seguir agregando secciones con el formato `[YYYY-MM-DD] Descripción del cambio` a medida que se implementen nuevas funcionalidades._
