# Guía de Publicación en Render — ProyectoBase Backend

## Resumen

Este documento describe el proceso completo para publicar el backend de **ProyectoBase** en [Render](https://render.com) usando Docker.

El deploy es **backend-only**: no incluye frontend ni nginx. El backend expone una API REST directamente a través de Kestrel (el servidor web de ASP.NET Core).

---

## Prerequisitos

- Cuenta activa en [render.com](https://render.com)
- Repositorio de GitHub conectado a Render
- Docker instalado localmente (opcional, solo para pruebas previas al deploy)

---

## Estructura de archivos relevantes

```
ProyectoBase/
├── Dockerfile                  ← usado por Render para el build
├── .dockerignore               ← excluye bin/, obj/, Frontend/, etc.
└── Backend/
    ├── ProyectoBase.csproj
    ├── Controllers/
    │   └── HealthController.cs ← endpoint GET /health/alive
    └── appsettings.json
```

---

## Paso 1 — Verificación local (opcional)

Antes de pushear, podés probar el build de Docker localmente desde la raíz del proyecto:

```bash
# Construir la imagen
docker build -t proyectobase-backend .

# Ejecutar el contenedor
docker run -p 5000:5000 -e ASPNETCORE_URLS=http://+:5000 proyectobase-backend
```

Verificar que el servicio responde:

```
http://localhost:5000/health/alive
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "ProyectoBase Backend",
  "timestamp": "2026-06-01T17:00:00Z",
  "environment": "Production"
}
```

---

## Paso 2 — Push a GitHub

Asegurarse de que todos los cambios estén commiteados y publicados:

```bash
git add .
git commit -m "chore: adapt deploy for Render - backend only"
git push
```

---

## Paso 3 — Crear el servicio en Render

1. Ingresar a [render.com](https://render.com)
2. Hacer clic en **New → Web Service**
3. Seleccionar el repositorio `ProyectoBase` de GitHub
4. Completar la configuración:

| Campo | Valor |
|---|---|
| **Name** | `proyectobase-backend` (o el deseado) |
| **Region** | Oregon (US West) u otra disponible |
| **Branch** | `main` (o la rama de producción) |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Docker Build Context** | `.` (raíz del repo) |

---

## Paso 4 — Variables de entorno

En la sección **Environment Variables** del servicio en Render, configurar:

| Key | Valor | Descripción |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` | Entorno de ejecución |
| `ConnectionStrings__DefaultConnection` | `User ID=...;Password=...;Host=...;Port=5432;Database=...;Pooling=true;` | Cadena de conexión PostgreSQL *(agregar cuando se tenga la DB)* |

> **Nota:** ASP.NET Core sobreescribe automáticamente los valores del `appsettings.json`  
> usando variables de entorno con el formato `Section__Clave` (doble guión bajo como separador).  
> Ejemplo: `ConnectionStrings__DefaultConnection` equivale a `appsettings["ConnectionStrings"]["DefaultConnection"]`.

---

## Paso 5 — Health Check

En **Settings → Health Check Path** del servicio, configurar:

```
/health/alive
```

Render usará este endpoint para determinar si el servicio está vivo. Si no responde con HTTP 200, Render reiniciará el contenedor automáticamente.

---

## Paso 6 — Deploy y verificación

- Render inicia el build automáticamente al detectar un nuevo push en la rama configurada
- El progreso se puede seguir en tiempo real desde la sección **Logs** del dashboard
- Una vez completado el deploy, el servicio estará disponible en:

```
https://<nombre-del-servicio>.onrender.com
```

### Endpoint de verificación

```
GET https://<nombre-del-servicio>.onrender.com/health/alive
```

---

## Re-deploy manual

Para forzar un nuevo deploy sin hacer un push (útil al cambiar variables de entorno):

1. Ir al dashboard del servicio en Render
2. Hacer clic en **Manual Deploy → Deploy latest commit**

---

## Consideraciones del plan gratuito de Render

| Aspecto | Comportamiento |
|---|---|
| **Inactividad** | El servicio se "duerme" luego de 15 minutos sin tráfico |
| **Tiempo de respuesta (frío)** | ~30 segundos en el primer request tras el sleep |
| **Horas de cómputo** | 750 horas/mes gratuitas |
| **Disponibilidad continua** | Requiere plan pago (Starter o superior) |

---

## Troubleshooting

### El build falla con error de `dotnet restore`
- Verificar que el `.csproj` esté en `Backend/ProyectoBase.csproj`
- Verificar que el `.dockerignore` no esté excluyendo archivos necesarios

### El servicio inicia pero `/health/alive` no responde
- Revisar los logs de Render para ver si hay excepciones al iniciar
- Verificar que `ASPNETCORE_URLS` esté seteado correctamente

### El servicio falla al conectar con la base de datos
- Verificar que `ConnectionStrings__DefaultConnection` esté correctamente configurada en las variables de entorno de Render
- Confirmar que la base de datos esté accesible desde internet (Render necesita acceso externo)
