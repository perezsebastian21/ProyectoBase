# Especificación de Contrato de API y Endpoints — Gestión de Roles (SuperAdmin / Administrador)

Base URL: `https://<tu-backend-domain>/` (o local `http://localhost:5000/`)

> [!IMPORTANT]
> **Formato Único de Respuesta HTTP (`ServiceResponse<T>`)**:
> Todos los endpoints descritos utilizan la estructura estandarizada de `ServiceResponse<T>`.
> Requieren la cabecera HTTP: `Authorization: Bearer <token>` emitida tras un login exitoso (`POST /Account/Login`).

---

## 📐 Estructura Estándar de Respuesta

### Respuesta Exitosa (`200 OK`)
```json
{
  "data": { /* Payload devuelto */ },
  "success": true,
  "errorMessage": null
}
```

### Respuesta con Error (`400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found`)
```json
{
  "data": null,
  "success": false,
  "errorMessage": "Descripción detallada del error."
}
```

---

## 🛠️ Endpoints de Gestión de Roles

### 1. Listar Catálogo de Roles Disponibles (`GET /Rol`)
Obtiene el catálogo completo de roles definidos en la base de datos (`PB_Rol`).

* **HTTP Method**: `GET`
* **Ruta**: `/Rol`
* **Roles Permitidos**: `SUPER_ADMINISTRADOR`, `ADMINISTRADOR_AVANZADO` (Policy `"ADMINISTRADOR"`).
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": [
    {
      "idRol": 1,
      "codigo": "SUPER_ADMINISTRADOR",
      "nombre": "Super Administrador",
      "descripcion": "Acceso total cross-tenant"
    },
    {
      "idRol": 2,
      "codigo": "ADMINISTRADOR_AVANZADO",
      "nombre": "Administrador Avanzado",
      "descripcion": "Gestión completa del consorcio"
    },
    {
      "idRol": 3,
      "codigo": "ADMINISTRADOR_LIVIANO",
      "nombre": "Administrador Liviano",
      "descripcion": "Operativo día a día sin guardia"
    },
    {
      "idRol": 4,
      "codigo": "GUARDIA",
      "nombre": "Guardia / Seguridad",
      "descripcion": "Control de accesos y portería"
    },
    {
      "idRol": 5,
      "codigo": "PROPIETARIO",
      "nombre": "Propietario",
      "descripcion": "Dueño de unidad con supervisión"
    },
    {
      "idRol": 6,
      "codigo": "INQUILINO",
      "nombre": "Inquilino",
      "descripcion": "Residente operativo de unidad"
    },
    {
      "idRol": 7,
      "codigo": "INVITADO",
      "nombre": "Invitado",
      "descripcion": "Acceso temporal con vigencia acotada"
    }
  ],
  "success": true,
  "errorMessage": null
}
```

---

### 2. Consultar Roles Asignados a un Usuario (`GET /Usuario/{idUsuario}/Roles`)
Obtiene la lista de roles activos que posee un usuario específico.

* **HTTP Method**: `GET`
* **Ruta**: `/Usuario/{idUsuario}/Roles`
* **Roles Permitidos**: `SUPER_ADMINISTRADOR`, `ADMINISTRADOR_AVANZADO` (Policy `"ADMINISTRADOR"`).
* **Ejemplo Request**: `GET /Usuario/1/Roles`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": [
    {
      "idRol": 1,
      "codigo": "SUPER_ADMINISTRADOR",
      "nombre": "Super Administrador",
      "descripcion": "Acceso total cross-tenant"
    },
    {
      "idRol": 2,
      "codigo": "ADMINISTRADOR_AVANZADO",
      "nombre": "Administrador Avanzado",
      "descripcion": "Gestión completa del consorcio"
    }
  ],
  "success": true,
  "errorMessage": null
}
```

---

### 3. Asignar Rol a un Usuario (`POST /Usuario/{idUsuario}/Roles`)
Permite a un SuperAdmin o Administrador Avanzado asignar un nuevo rol a un usuario determinado. Si el rol ya está asignado, retorna un error de negocio de duplicado sin romper la base de datos.

* **HTTP Method**: `POST`
* **Ruta**: `/Usuario/{idUsuario}/Roles`
* **Roles Permitidos**: `SUPER_ADMINISTRADOR`, `ADMINISTRADOR_AVANZADO`.
* **Payload Request (`Body JSON`)**:
```json
{
  "idRol": 2
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idUsuarioRol": 15,
    "idUsuario": 1,
    "idRol": 2,
    "codigoRol": "ADMINISTRADOR_AVANZADO",
    "nombreRol": "Administrador Avanzado"
  },
  "success": true,
  "errorMessage": null
}
```
* **Respuesta Error (`400 Bad Request`)**:
```json
{
  "data": null,
  "success": false,
  "errorMessage": "El usuario ya posee el rol especificado."
}
```

---

### 4. Remover Rol de un Usuario (`DELETE /Usuario/{idUsuario}/Roles/{idRol}`)
Permite remover un rol asignado a un usuario.

* **HTTP Method**: `DELETE`
* **Ruta**: `/Usuario/{idUsuario}/Roles/{idRol}`
* **Roles Permitidos**: `SUPER_ADMINISTRADOR`, `ADMINISTRADOR_AVANZADO`.
* **Ejemplo Request**: `DELETE /Usuario/1/Roles/2`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": true,
  "success": true,
  "errorMessage": null
}
```
* **Respuesta Error (`404 Not Found`)**:
```json
{
  "data": null,
  "success": false,
  "errorMessage": "La asignación de rol especificada no existe para este usuario."
}
```
