# Especificación de Contrato de API — Invitaciones y Onboarding de Usuarios

Base URL: `https://<tu-backend-domain>/` (o local `http://localhost:5000/`)

> [!IMPORTANT]
> **Formato Único de Respuesta HTTP (`ServiceResponse<T>`)**:
> Todos los endpoints descritos utilizan la estructura estandarizada de `ServiceResponse<T>`.

---

## 🛠️ Endpoints del Controlador 1: `InvitacionController` (`/api/invitaciones`)

### 1. Crear Invitación de Administración (`POST /api/invitaciones/crear-admin`)
Permite a un `SUPER_ADMINISTRADOR` enviar una invitación a un Administrador Avanzado.

* **HTTP Method**: `POST`
* **Ruta**: `/api/invitaciones/crear-admin`
* **Autorización**: `[Authorize(Roles = "SUPER_ADMINISTRADOR")]`
* **Payload Request**:
```json
{
  "emailDestino": "admin.edificio@consorcio.com",
  "nombre": "Carlos",
  "apellido": "Gómez"
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idInvitacion": 10,
    "emailDestino": "admin.edificio@consorcio.com",
    "token": "4f8a3c9b1e2d4a5f6e7d8c9b0a1b2c3d",
    "rolDestino": "ADMINISTRADOR_AVANZADO",
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-08-18T12:00:00Z",
    "fechaExpiracion": "2026-08-25T12:00:00Z"
  },
  "success": true,
  "errorMessage": null
}
```

---

### 2. Crear Invitaciones Masivas a Propietarios (`POST /api/invitaciones/masivas`)
Permite a un `ADMINISTRADOR_AVANZADO` o `SUPER_ADMINISTRADOR` enviar invitaciones para vincular propietarios a un consorcio o departamento.

* **HTTP Method**: `POST`
* **Ruta**: `/api/invitaciones/masivas`
* **Autorización**: `[Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]`
* **Payload Request**:
```json
{
  "idConsorcio": 1,
  "idComplejo": 2,
  "invitaciones": [
    {
      "idUnidadHabitacional": 105,
      "emailDestino": "propietario.4b@gmail.com"
    },
    {
      "idUnidadHabitacional": 106,
      "emailDestino": "propietario.4c@gmail.com"
    }
  ]
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": [
    {
      "idInvitacion": 11,
      "idConsorcio": 1,
      "idComplejo": 2,
      "idUnidadHabitacional": 105,
      "emailDestino": "propietario.4b@gmail.com",
      "token": "a1b2c3d4e5f67890123456789abcdef0",
      "rolDestino": "PROPIETARIO",
      "estado": "PENDIENTE"
    }
  ],
  "success": true,
  "errorMessage": null
}
```

---

### 3. Crear Invitación a Inquilino (`POST /api/invitaciones/inquilino`)
Permite a un `PROPIETARIO` invitar a un inquilino a su unidad habitacional.

* **HTTP Method**: `POST`
* **Ruta**: `/api/invitaciones/inquilino`
* **Autorización**: `[Authorize(Roles = "PROPIETARIO")]`
* **Payload Request**:
```json
{
  "idUnidadHabitacional": 105,
  "emailDestino": "inquilino.nuevo@gmail.com"
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idInvitacion": 12,
    "idUnidadHabitacional": 105,
    "emailDestino": "inquilino.nuevo@gmail.com",
    "token": "9876543210fedcba0987654321fedcba",
    "rolDestino": "INQUILINO",
    "estado": "PENDIENTE"
  },
  "success": true,
  "errorMessage": null
}
```

---

### 4. Validar Token de Invitación (`GET /api/invitaciones/validar/{token}`)
Endpoint público utilizado por el Frontend cuando el usuario abre el enlace de la invitación.

* **HTTP Method**: `GET`
* **Ruta**: `/api/invitaciones/validar/{token}`
* **Autorización**: `Público (AllowAnonymous)`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "token": "9876543210fedcba0987654321fedcba",
    "valido": true,
    "emailDestino": "propietario.4b@gmail.com",
    "rolDestino": "PROPIETARIO",
    "nombreConsorcio": "Consorcio Las Heras",
    "nombreComplejo": "Torre A",
    "identificadorUnidad": "Depto 4º B",
    "esUsuarioExistente": false,
    "mensaje": "Invitación válida."
  },
  "success": true,
  "errorMessage": null
}
```

---

### 5. Aceptar Invitación y Registro (`POST /api/invitaciones/aceptar`)
Endpoint público para que el usuario complete su contraseña y acepte la invitación.

* **HTTP Method**: `POST`
* **Ruta**: `/api/invitaciones/aceptar`
* **Autorización**: `Público (AllowAnonymous)`
* **Payload Request**:
```json
{
  "token": "9876543210fedcba0987654321fedcba",
  "password": "PasswordSegura123!",
  "esOcupanteActual": true
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idUsuario": 45,
    "username": "propietario.4b",
    "email": "propietario.4b@gmail.com",
    "rol": "PROPIETARIO"
  },
  "success": true,
  "errorMessage": null
}
```

---

## 🛠️ Endpoints del Controlador 2: `UsuarioUnidadController` (`/api/usuario-unidad`)

### 6. Listar Solicitudes Pendientes de Validación (`GET /api/usuario-unidad/pendientes`)
Permite a un Administrador Avanzado ver las solicitudes de propietarios pendientes de confirmación.

* **HTTP Method**: `GET`
* **Ruta**: `/api/usuario-unidad/pendientes?idConsorcio=1`
* **Autorización**: `[Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": [
    {
      "idUsuarioUnidad": 15,
      "idUsuario": 45,
      "username": "propietario.4b",
      "email": "propietario.4b@gmail.com",
      "idUnidadHabitacional": 105,
      "identificadorUnidad": "Depto 4º B",
      "nombreConsorcio": "Consorcio Las Heras",
      "tipoRelacion": "PROPIETARIO",
      "esOcupanteActual": true,
      "estadoRelacion": "PENDIENTE_APROBACION_ADMIN",
      "fechaInicio": "2026-08-18T12:30:00Z"
    }
  ],
  "success": true,
  "errorMessage": null
}
```

---

### 7. Aprobar Vinculación de Propietario (`POST /api/usuario-unidad/{id}/aprobar`)
Pasa el estado de la vinculación a `"VIGENTE"`.

* **HTTP Method**: `POST`
* **Ruta**: `/api/usuario-unidad/15/aprobar`
* **Autorización**: `[Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idUsuarioUnidad": 15,
    "idUsuario": 45,
    "idUnidadHabitacional": 105,
    "tipoRelacion": "PROPIETARIO",
    "esOcupanteActual": true,
    "estadoRelacion": "VIGENTE"
  },
  "success": true,
  "errorMessage": null
}
```

---

### 8. Rechazar Vinculación de Propietario (`POST /api/usuario-unidad/{id}/rechazar`)
Pasa el estado a `"RECHAZADA"` con motivo explicativo.

* **HTTP Method**: `POST`
* **Ruta**: `/api/usuario-unidad/15/rechazar`
* **Autorización**: `[Authorize(Roles = "ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]`
* **Payload Request**:
```json
{
  "motivoRechazo": "El usuario no figura en la escritura declarada."
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idUsuarioUnidad": 15,
    "idUsuario": 45,
    "idUnidadHabitacional": 105,
    "tipoRelacion": "PROPIETARIO",
    "estadoRelacion": "RECHAZADA",
    "motivoRechazo": "El usuario no figura en la escritura declarada."
  },
  "success": true,
  "errorMessage": null
}
```

---

### 9. Mis Unidades del Residente Autenticado (`GET /api/usuario-unidad/mis-unidades`)
Obtiene la lista de unidades habitacionales vinculadas al usuario actualmente autenticado (en estado `"VIGENTE"`).

* **HTTP Method**: `GET`
* **Ruta**: `/api/usuario-unidad/mis-unidades` (Alias soportados: `/usuario-unidad/mis-unidades`, `/UsuarioUnidad/mis-unidades`)
* **Autorización**: `[Authorize]` (Residente, Propietario, Inquilino, Admin).
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": [
    {
      "idUsuarioUnidad": 15,
      "idUnidadHabitacional": 105,
      "identificadorUnidad": "Depto 4º B",
      "idComplejo": 2,
      "nombreComplejo": "Torre A",
      "idConsorcio": 1,
      "nombreConsorcio": "Consorcio Las Heras",
      "tipoRelacion": "PROPIETARIO",
      "esOcupanteActual": true,
      "estadoRelacion": "VIGENTE"
    }
  ],
  "success": true,
  "errorMessage": null
}
```

