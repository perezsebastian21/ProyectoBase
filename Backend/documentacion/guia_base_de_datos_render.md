# Guía de Base de Datos PostgreSQL en Render — ProyectoBase Backend

## Resumen

Este documento describe cómo crear la base de datos PostgreSQL en Render y conectarla al backend de ProyectoBase. **No es necesario crear las tablas manualmente**: la aplicación aplica las migraciones de Entity Framework automáticamente al iniciar.

---

## Cómo funciona el esquema de base de datos

El proyecto usa **Entity Framework Core** con migraciones. Al arrancar, el backend ejecuta automáticamente:

```csharp
db.Database.Migrate();
```

Esto significa que en el **primer deploy**:
1. Se conecta a la base de datos de Render
2. Detecta que no existen las tablas
3. Ejecuta la migración `InitialCreate` y crea `PB_Persona`

En deploys posteriores, si no hay migraciones nuevas, no hace nada.

### Tabla creada

**`PB_Persona`**

| Columna | Tipo | Restricciones |
|---|---|---|
| `IDPersona` | `integer` | PK, autoincremental |
| `Nombre` | `varchar(150)` | NOT NULL |
| `Apellido` | `varchar(150)` | NOT NULL |
| `FechaNacimiento` | `timestamp` | NOT NULL |
| `Dni` | `varchar(20)` | NOT NULL, UNIQUE |
| `Email` | `varchar(250)` | UNIQUE |
| `Celular` | `varchar(50)` | — |

---

## Paso 1 — Crear la base de datos PostgreSQL en Render

1. Ingresar a [render.com](https://render.com) → **New → PostgreSQL**
2. Completar la configuración:

| Campo | Valor sugerido |
|---|---|
| **Name** | `proyectobase-db` |
| **Database** | `proyectobase` |
| **User** | `proyectobase_user` |
| **Region** | La misma que el Web Service (ej: Oregon) |
| **Plan** | Free (1 GB, válido 90 días) |

3. Hacer clic en **Create Database**
4. Esperar unos segundos hasta que el estado sea **Available**

---

## Paso 2 — Obtener la cadena de conexión

Una vez creada la DB, en el panel de la base de datos en Render:

1. Ir a la sección **Connections**
2. Copiar el valor de **Internal Database URL** (se usa dentro de Render, sin costo de red)
   - Tiene la forma: `postgresql://user:password@host/database`
3. Convertir ese formato al que usa Npgsql (ADO.NET):

### Conversión de formato

| Render da | Npgsql necesita |
|---|---|
| `postgresql://user:pass@host:5432/dbname` | `User ID=user;Password=pass;Host=host;Port=5432;Database=dbname;Pooling=true;` |

**Ejemplo:**
```
# URL de Render:
postgresql://proyectobase_user:abc123@dpg-xxxxx-a.oregon-postgres.render.com/proyectobase

# Connection string para Npgsql:
User ID=proyectobase_user;Password=abc123;Host=dpg-xxxxx-a.oregon-postgres.render.com;Port=5432;Database=proyectobase;Pooling=true;
```

> **Tip:** Render también muestra directamente la connection string en formato ADO.NET si hacés scroll en la sección **Connections**.

---

## Paso 3 — Conectar la DB al Web Service

En el **Web Service** de Render (no en la DB):

1. Ir a **Environment → Environment Variables**
2. Agregar la variable:

| Key | Value |
|---|---|
| `ConnectionStrings__DefaultConnection` | `User ID=...;Password=...;Host=...;Port=5432;Database=...;Pooling=true;` |

> **Nota:** El doble guión bajo `__` es el separador de secciones de ASP.NET Core.  
> `ConnectionStrings__DefaultConnection` equivale a `appsettings.json → ConnectionStrings → DefaultConnection`.

---

## Paso 4 — Re-deployar el backend

Después de agregar la variable de entorno:

1. Ir al **Web Service** en Render
2. **Manual Deploy → Deploy latest commit**
3. Seguir los logs — deberías ver algo como:

```
Iniciando ProyectoBase Backend
Applying pending migrations...   ← migraciones aplicadas automáticamente
Now listening on: http://0.0.0.0:5000
Application started.
```

---

## Paso 5 — Verificación

### 1. Health check del servicio
```
GET https://<tu-servicio>.onrender.com/health/alive
```
Respuesta esperada: `200 OK`

### 2. Probar el endpoint de Personas (lista vacía inicial)
```
GET https://<tu-servicio>.onrender.com/persona
```
Respuesta esperada:
```json
{
  "data": [],
  "pageInfo": { ... }
}
```

### 3. Crear una persona de prueba
```http
POST https://<tu-servicio>.onrender.com/persona
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Perez",
  "fechaNacimiento": "1990-01-15T00:00:00",
  "dni": "30123456",
  "email": "juan.perez@ejemplo.com",
  "celular": "2235551234"
}
```

---

## Consideraciones del plan gratuito de Render (PostgreSQL)

| Aspecto | Detalle |
|---|---|
| **Duración** | 90 días desde la creación |
| **Almacenamiento** | 1 GB |
| **Conexiones** | 97 máximas |
| **Backups** | No incluidos en free |
| **Expiración** | La DB se elimina automáticamente a los 90 días |

> [!WARNING]
> Al vencer los 90 días del plan gratuito, Render elimina la base de datos y **todos los datos se pierden**. Para producción real usar un plan pago o migrar a otro proveedor (Supabase, Neon, ElephantSQL, etc.).

---

## Agregar una nueva migración en el futuro

Cuando se modifique el modelo (nuevas tablas, columnas, etc.):

```bash
# Desde la carpeta Backend/
dotnet ef migrations add NombreDeLaMigracion

# Verificar el SQL generado (opcional)
dotnet ef migrations script

# Al deployar, la app aplica la migración automáticamente
```

No es necesario correr `dotnet ef database update` en producción: el `db.Database.Migrate()` del `Program.cs` lo hace al arrancar.
