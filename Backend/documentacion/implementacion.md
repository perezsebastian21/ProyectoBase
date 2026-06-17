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

---

## [2026-06-05] Seed de usuarios iniciales

### Descripción
Se insertan los 3 usuarios del sistema mediante una migración de seed idempotente (no duplica si ya existen).

### Migración generada

| Migración | Descripción |
|---|---|
| `SeedUsuariosIniciales` | Inserta `seba`, `julian` y `juancruz` con password `123` si no existen |

### Usuarios insertados

| Username | Password | Email |
|---|---|---|
| `seba` | `123` | seba@proyectobase.com |
| `julian` | `123` | julian@proyectobase.com |
| `juancruz` | `123` | juancruz@proyectobase.com |

---

## [2026-06-05] `UsuarioService` + Login real en `AccountController`

### Descripción
Se implementa el servicio de autenticación de usuarios del sistema. El `AccountController` ahora valida credenciales contra la base de datos (en lugar de generar un token sin validación). Se corrigieron además errores de referencias a un proyecto externo (`rsFoodtrucks`) que impedían compilar.

### Archivos creados

| Archivo | Descripción |
|---|---|
| `Backend/Services/UsuarioService/IUsuarioService.cs` | Interfaz con el método `ValidarCredenciales(username, password)` |
| `Backend/Services/UsuarioService/UsuarioService.cs` | Implementación usando `ApplicationDbContext` con consulta LINQ sobre `PB_Usuario` |
| `Backend/ProyectoBase.Tests/Services/UsuarioServiceTests.cs` | Tests del servicio usando EF Core InMemory |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `Backend/Controllers/AccountController.cs` | Reescrito: inyecta `IUsuarioService`, método `async`, valida credenciales, retorna `401` si son inválidas |
| `Backend/Program.cs` | Registrado `IUsuarioService` / `UsuarioService` en el contenedor de DI |
| `Backend/ProyectoBase.Tests/Controllers/AccountControllerTests.cs` | Reescrito para cubrir el nuevo flujo de login con validación real |
| `Backend/ProyectoBase.Tests/ProyectoBase.Tests.csproj` | Agregado paquete `Microsoft.EntityFrameworkCore.InMemory` para tests del servicio |

### Lógica del login

```
POST /Account/Login  { "usuario": "seba", "password": "123" }
  → UsuarioService.ValidarCredenciales("seba", "123")
      → SELECT * FROM PB_Usuario WHERE Username = 'seba' AND Password = '123' AND Activo = true
  → Si existe: genera JWT → 200 OK { token, expiration, username }
  → Si no existe: 401 Unauthorized { message: "Usuario o contraseña incorrectos." }
```

### Tests unitarios agregados

**`AccountControllerLoginTests`** (7 tests — Moq sobre `IUsuarioService` e `ITokenService`)

| Test | Descripción |
|---|---|
| `Login_CredencialesValidas_DebeRetornar200ConToken` | HTTP 200 con token en el body |
| `Login_CredencialesInvalidas_DebeRetornar401` | HTTP 401 si la password es incorrecta |
| `Login_UsuarioInexistente_DebeRetornar401` | HTTP 401 si el username no existe |
| `Login_CredencialesValidas_BodyDebeContenerElToken` | El token del servicio llega al body |
| `Login_CredencialesValidas_BodyDebeContenerUsername` | El username está presente en el body |
| `Login_CredencialesValidas_DebeGenerarTokenConUsernameDeDB` | El token se genera con el username de la BD |
| `Login_CredencialesInvalidas_NoDebeGenerarToken` | `GenerateAdminToken` no se llama si las credenciales son inválidas |

**`UsuarioServiceTests`** (6 tests — EF Core InMemory)

| Test | Descripción |
|---|---|
| `ValidarCredenciales_UsuarioActivoYPasswordCorrecta_RetornaUsuario` | Retorna el usuario cuando las credenciales son válidas |
| `ValidarCredenciales_PasswordIncorrecta_RetornaNull` | Retorna `null` si la password no coincide |
| `ValidarCredenciales_UsuarioInexistente_RetornaNull` | Retorna `null` si el username no existe |
| `ValidarCredenciales_UsuarioInactivo_RetornaNull` | Usuarios con `Activo = false` no pueden autenticarse |
| `ValidarCredenciales_UsernameCaseDiferente_RetornaNull` | Comparación case-sensitive (`seba` ≠ `SEBA`) |
| `ValidarCredenciales_SegundoUsuarioValido_RetornaUsuarioCorrecto` | Múltiples usuarios del sistema funcionan correctamente |

### Total de tests del proyecto: 28/28 ✅

---

## [2026-06-05] Fix — Migraciones seed no reconocidas por EF Core

### Descripción
Se detectó que los usuarios `seba`, `julian` y `juancruz` no existían en la base de datos de producción (Render), causando `401 Unauthorized` al intentar hacer login. La causa fue que las migraciones de seed anteriores (`SeedUsuarioSeba` y `SeedUsuariosIniciales`) se habían creado **manualmente** como archivos `.cs` sueltos, sin el archivo `.Designer.cs` que EF Core requiere para reconocer y ejecutar una migración.

> [!CAUTION]
> Las migraciones de EF Core **nunca deben crearse manualmente** como archivos `.cs` sueltos. Sin el `.Designer.cs`, EF Core las ignora completamente y no las ejecuta ni en `dotnet ef database update` ni en `db.Database.Migrate()` al iniciar la app.

### Causa raíz

```bash
# EF solo veía estas migraciones (las manuales no aparecían):
dotnet ef migrations list
→ 20260520162536_InitialCreate
→ 20260604183100_AddUsuarioEntity
→ 20260605115341_RemoveIDPersonaFromUsuario
# SeedUsuarioSeba y SeedUsuariosIniciales: AUSENTES
```

### Solución aplicada

1. Se eliminaron los archivos manuales huérfanos:
   - `20260604183200_SeedUsuarioSeba.cs`
   - `20260605120900_SeedUsuariosIniciales.cs`

2. Se creó la migración correctamente con el comando oficial:
   ```bash
   dotnet ef migrations add SeedUsuariosIniciales
   ```
   Esto generó tanto el `.cs` como el `.Designer.cs`.

3. Se agregó el SQL de seed idempotente dentro del método `Up()` de la migración oficial.

4. Se aplicó localmente con `dotnet ef database update` y se hizo push a `main`.

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `Backend/Migrations/20260604183200_SeedUsuarioSeba.cs` | **Eliminado** (era huérfano sin Designer.cs) |
| `Backend/Migrations/20260605120900_SeedUsuariosIniciales.cs` | **Eliminado** (era huérfano sin Designer.cs) |
| `Backend/Migrations/20260605130045_SeedUsuariosIniciales.cs` | **Creado** — migración oficial con SQL de seed |
| `Backend/Migrations/20260605130045_SeedUsuariosIniciales.Designer.cs` | **Creado** — archivo de snapshot requerido por EF |

### Regla a seguir de ahora en adelante

| ✅ Correcto | ❌ Incorrecto |
|---|---|
| `dotnet ef migrations add NombreMigracion` | Crear archivos `.cs` de migración manualmente |

> _Seguir agregando secciones con el formato `[YYYY-MM-DD] Descripción del cambio` a medida que se implementen nuevas funcionalidades._

---

## [2026-06-17] Entidades `Consorcio` y `Complejo`

### Descripción
Se agregaron las entidades `Consorcio` y `Complejo` correspondientes al módulo de Onboarding (CU-08) tal como lo indica la especificación `specs (2)(2)(1).md`. Se definieron utilizando clases POCO sin `DataAnnotations` y configurando el mapeo estricto a través de Fluent API en `ApplicationDbContext`.

### Archivos creados

| Archivo | Descripción |
|---|---|
| `Backend/Models/Consorcio.cs` | Clase de entidad que representa al consorcio administrador. |
| `Backend/Models/Complejo.cs` | Clase de entidad que representa el edificio o barrio administrado. |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `Backend/Models/ApplicationDbContext.cs` | Agregado `DbSet` de ambas entidades y mapeo en `OnModelCreating` (Tablas: `PB_Consorcio`, `PB_Complejo`). Restricciones de longitud, índices únicos y Foreign Key `DeleteBehavior.Restrict`. |

### Migración de base de datos
Se generó y ejecutó exitosamente la migración:
- Nombre: `CU08_ConsorcioComplejoDomain`
- Tablas creadas: `PB_Consorcio`, `PB_Complejo`
- Se generó un script SQL idempotente en `scripts/002_CU08_ConsorcioComplejoDomain.sql`.

> _Seguir agregando secciones con el formato `[YYYY-MM-DD] Descripción del cambio` a medida que se implementen nuevas funcionalidades._
