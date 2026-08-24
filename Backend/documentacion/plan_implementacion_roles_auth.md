# Plan de Implementación - Autenticación y Autorización Multi-Rol (PB_Rol + PB_UsuarioRol)

Este documento describe la arquitectura final y el plan de ejecución para la migración del sistema de autenticación a **Multi-Rol con JWT Bearer y Authorization Policies**, acorde a la actualización de `specs-unificado.md` (Sección SPEC-AUTH v2).

---

## 1. Arquitectura de Datos (Multi-Rol N:M)

### 1.1 Entidades de Base de Datos
- **`PB_Rol` (`Models/Rol.cs`)**:
  - `IDRol` (PK, int)
  - `Codigo` (string, max 30, ej: `"SUPER_ADMINISTRADOR"`, `"ADMINISTRADOR_AVANZADO"`, `"ADMINISTRADOR_LIVIANO"`, `"GUARDIA"`, `"INQUILINO"`, `"PROPIETARIO"`, `"INVITADO"`)
  - `Nombre` (string, max 100)
  - `Descripcion` (string, max 250, opcional)
- **`PB_UsuarioRol` (`Models/UsuarioRol.cs`)**:
  - `IDUsuarioRol` (PK, int)
  - `IDUsuario` (FK a `PB_Usuario`)
  - `IDRol` (FK a `PB_Rol`)
- **`PB_Usuario` (`Models/Usuario.cs`)**:
  - `IDUsuario` (PK, int)
  - `Email` (string, max 250, único)
  - `Username` (string, max 100, único)
  - `Password` (o `PasswordHash`, string, max 255)
  - `Activo` (bool, default true)

---

## 2. Emisión y Validación de Tokens JWT (Multi-Claim)

### 2.1 Emisión en `TokenService`
Al autenticarse el usuario en `POST /Account/Login`:
1. El backend consulta el usuario con sus relaciones en `PB_UsuarioRol` -> `PB_Rol`.
2. Se inyectan en el JWT múltiples claims `ClaimTypes.Role` (uno por cada rol activo asignado al usuario).
3. Se incluyen claims adicionales: `ClaimTypes.NameIdentifier` (`IDUsuario`), `ClaimTypes.Name` (`Username`), `ClaimTypes.Email`, `Jti`.

### 2.2 Políticas de Autorización (`Program.cs`)
- **Policy `"RESIDENTE"`**: `policy.RequireRole("INQUILINO", "PROPIETARIO")`
- **Policy `"ADMINISTRADOR"`**: `policy.RequireRole("ADMINISTRADOR_AVANZADO", "SUPER_ADMINISTRADOR")`

---

## 3. Plan de Cambios por Componente

### Backend / Models & DbContext
1. **[NEW]** `Backend/Models/Rol.cs`
2. **[NEW]** `Backend/Models/UsuarioRol.cs`
3. **[MODIFY]** `Backend/Models/Usuario.cs` (agregar colección `UsuarioRoles`, remover o desestimar columna `Rol` directa).
4. **[MODIFY]** `Backend/Models/ApplicationDbContext.cs` (mapear `PB_Rol` y `PB_UsuarioRol` con claves e índices).

### Backend / Migrations & Data Seed
5. **[NEW]** EF Core Migration `AddMultiRolEntities`:
   - Crea `PB_Rol` y `PB_UsuarioRol`.
   - Seed inicial en `PB_Rol` con los 7 roles del sistema.
   - Script de migración/backfill que asigne roles por defecto a usuarios existentes en `PB_UsuarioRol`.

### Backend / Services & Controllers
6. **[MODIFY]** `Backend/Services/TokenService/TokenService.cs` & `ITokenService.cs`: Generar JWT con lista de roles.
7. **[MODIFY]** `Backend/Services/UsuarioService/UsuarioService.cs`: Hashing de contraseñas con `IPasswordHasher<Usuario>` y carga de roles en login/validación.
8. **[MODIFY]** `Backend/Controllers/AccountController.cs`: Devolver token y resumen de roles del usuario.
9. **[MODIFY]** `Backend/Program.cs`: Configurar `AddAuthentication(JwtBearerDefaults)`, `AddAuthorization(options => policies)`, `UseAuthentication()`, y Swagger Security Scheme.
10. **[MODIFY]** Endpoints en controladores (`ReservaController`, `DisponibilidadController`, `IncidenciaController`, etc.): Decorar con `[Authorize(Roles = "...")]` o `[Authorize(Policy = "...")]`.

---

## 4. Plan de Pruebas y Verificación

### Pruebas Unitarias
- `TokenServiceTests`: Verificar que un usuario con roles `ADMINISTRADOR_AVANZADO` e `INQUILINO` genera un JWT con ambos claims.
- `UsuarioServiceTests`: Verificar hashing de contraseñas y asignación/lectura de roles en `PB_UsuarioRol`.

### Pruebas de Integración (Swagger & Endpoints)
1. **Login de Usuario Multi-Rol:** Probar `POST /Account/Login` para un usuario con roles `ADMINISTRADOR_AVANZADO` e `INQUILINO`.
2. **Prueba de Permisos:**
   - Enviar JWT a un endpoint protegido solo para Administradores -> Verificar `200 OK`.
   - Enviar JWT a un endpoint de Residente -> Verificar `200 OK`.
   - Autenticar un `GUARDIA` e intentar acceder a un endpoint restringido para Admin -> Verificar `403 Forbidden`.
   - Ejecutar endpoint sin Bearer Token -> Verificar `401 Unauthorized`.
