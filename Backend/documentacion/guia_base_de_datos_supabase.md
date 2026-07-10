# Guía de Base de Datos PostgreSQL en Supabase — ProyectoBase Backend

## Resumen

Este documento describe cómo conectar el backend de ProyectoBase a una base de datos PostgreSQL alojada en **Supabase** en lugar de Render. **No es necesario crear las tablas manualmente**: la aplicación aplica las migraciones de Entity Framework Core automáticamente al iniciar, aprovisionando el esquema completo y los datos semilla (seeds).

---

## Cómo funciona el esquema de base de datos

El proyecto usa **Entity Framework Core** con migraciones. Al arrancar, el backend ejecuta automáticamente:

```csharp
db.Database.Migrate();
```

Esto significa que en el primer inicio contra la base de datos de Supabase:
1. Se conecta a la base de datos PostgreSQL en Supabase.
2. Detecta que no existen las tablas.
3. Ejecuta todas las migraciones acumuladas (`InitialCreate`, `AddUsuarioEntity`, `SeedUsuariosIniciales`, `CU08_ConsorcioComplejoDomain`, etc.) para crear la estructura completa y precargar los usuarios iniciales (`seba`, `julian`, `juancruz` con contraseña `123`).

---

## Estructura de la Cadena de Conexión (Connection String)

Para que Entity Framework Core (a través de Npgsql) pueda comunicarse con Supabase, es necesario transformar las credenciales al formato estándar de ADO.NET/Npgsql.

### Conversión de Formato

Supabase proporciona una URI de conexión con la siguiente forma:
`postgresql://postgres:[YOUR-PASSWORD]@db.pacnmfzfvjthiuxinubo.supabase.co:5432/postgres`

Para Npgsql (usado por ASP.NET Core), se debe traducir de la siguiente forma, asegurando activar el uso de SSL:

```text
User ID=postgres;Password=[YOUR-PASSWORD];Host=db.pacnmfzfvjthiuxinubo.supabase.co;Port=5432;Database=postgres;Pooling=true;SSL Mode=Require;Trust Server Certificate=true;
```

> [!IMPORTANT]
> **Detalles de SSL:**
> Las bases de datos de Supabase requieren conexiones seguras. Por lo tanto, los parámetros `SSL Mode=Require;Trust Server Certificate=true;` son esenciales para evitar errores de conexión SSL/TLS durante el handshake.

---

## Configuración en Producción (Render)

Para cambiar la base de datos que utiliza el Web Service alojado en Render:

1. Ingresar al panel de control de [Render](https://render.com).
2. Seleccionar el Web Service del Backend (`proyectobase-backend`).
3. Ir a la sección **Environment** (Variables de Entorno).
4. Localizar la variable **`ConnectionStrings__DefaultConnection`**.
5. Reemplazar su valor actual por la cadena de conexión de Supabase en formato Npgsql:
   ```text
   User ID=postgres;Password=[TU_CONTRASEÑA];Host=db.pacnmfzfvjthiuxinubo.supabase.co;Port=5432;Database=postgres;Pooling=true;SSL Mode=Require;Trust Server Certificate=true;
   ```
6. Guardar los cambios. Render reiniciará el contenedor automáticamente.
7. Seguir los logs de inicio de Render para verificar que:
   - Se conecte correctamente a Supabase.
   - Aplique las migraciones pendientes automáticamente.

---

## Configuración en Desarrollo Local

Si deseas probar la conexión a Supabase desde tu entorno de desarrollo local:

1. Abrir el archivo `Backend/appsettings.json` (o crear un `Backend/appsettings.Development.json` si no existe).
2. Configurar la propiedad `DefaultConnection` en la sección `ConnectionStrings`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "User ID=postgres;Password=[TU_CONTRASEÑA];Host=db.pacnmfzfvjthiuxinubo.supabase.co;Port=5432;Database=postgres;Pooling=true;SSL Mode=Require;Trust Server Certificate=true;"
  }
}
```

3. Ejecutar el proyecto localmente:
   ```bash
   dotnet run --project Backend/ProyectoBase.csproj
   ```

---

## Verificación de Conectividad y Estado

Una vez realizado el cambio de base de datos, puedes validar el estado del sistema mediante los siguientes endpoints del backend:

### 1. Health Check
```http
GET https://<tu-servicio-en-render>.onrender.com/health/alive
```
*Respuesta esperada:* `200 OK` (indica que el contenedor arrancó exitosamente).

### 2. Login con Usuario Semilla
Realizar un request POST para validar que el backend pueda consultar la tabla `PB_Usuario` de Supabase:

```http
POST https://<tu-servicio-en-render>.onrender.com/Account/Login
Content-Type: application/json

{
  "usuario": "seba",
  "password": "123"
}
```
*Respuesta esperada:* `200 OK` junto con el token JWT de sesión.
