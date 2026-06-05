# Documento de Implementación — ProyectoBase

Este archivo registra de forma cronológica los pasos de implementación realizados sobre el proyecto.

---

## [2026-06-04] Entidad `Usuario`

### Descripción
Se incorpora la entidad `Usuario` para gestionar los usuarios del sistema. Inicialmente se creó con relación a `Persona` (luego refactorizado, ver entrada 2026-06-05).

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
- ~~**FK:** `IDPersona → PB_Persona.IDPersona`~~ _(eliminado en refactor 2026-06-05)_

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

## [2026-06-05] Refactor `Usuario` — Desacoplamiento del core

### Descripción
Se decide que la entidad `Usuario` represente exclusivamente a los usuarios del sistema (autenticación/autorización) y no tenga relación con el dominio de negocio (`Persona`). Se elimina `IDPersona` y la propiedad de navegación correspondiente.

### Archivos modificados

| Archivo | Cambio |
|---|---------|
| `Backend/Models/Usuario.cs` | Eliminados `IDPersona` (FK) y la propiedad de navegación `Persona` |
| `Backend/Models/ApplicationDbContext.cs` | Eliminada la configuración Fluent API `HasOne/WithMany/HasForeignKey` de la relación con `Persona` |
| `Backend/ProyectoBase.Tests/Controllers/UsuarioControllerTests.cs` | Actualizados los objetos de prueba para reflejar el modelo sin `IDPersona` |

### Modelo de datos actualizado

```csharp
public class Usuario
{
    public int IDUsuario { get; set; }
    public string Username { get; set; }    // Único, máx 100 chars
    public string Password { get; set; }    // Máx 255 chars
    public string Email { get; set; }       // Único, máx 250 chars
    public bool Activo { get; set; }        // Default: true
}
```

### Tabla en BD resultante

- **Nombre:** `PB_Usuario`
- **PK:** `IDUsuario`
- **Índices únicos:** `Username`, `Email`
- **Sin FK** — entidad independiente del core

### Migraciones generadas

| Migración | Descripción |
|---|---|
| `AddUsuarioEntity` | Crea la tabla `PB_Usuario` con `IDPersona` |
| `SeedUsuarioSeba` | Inserta usuario de prueba `seba` (condicionado a existencia de Personas) |
| `RemoveIDPersonaFromUsuario` | Elimina la columna `IDPersona` y el índice FK de `PB_Usuario` |

Todas se aplican automáticamente en el arranque de la app via `db.Database.Migrate()`.

### Impacto en producción (Render)

El push a `main` dispara el redeploy automático en Render. Al arrancar, la migración `RemoveIDPersonaFromUsuario` se aplica sobre la BD de producción sin intervención manual.

---

> _Seguir agregando secciones con el formato `[YYYY-MM-DD] Descripción del cambio` a medida que se implementen nuevas funcionalidades._
