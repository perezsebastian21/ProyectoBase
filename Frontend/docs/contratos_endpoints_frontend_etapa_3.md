# Especificación de Contrato de API y Endpoints — Etapa 3 (Frontend Integration)

Base URL: `https://<tu-backend-domain>/` (o local `http://localhost:5000/`)

> [!IMPORTANT]
> **Formato Único de Respuesta HTTP (`ServiceResponse<T>`)**:
> Todos los endpoints de la API (tanto exitosos como de error) devuelven una estructura estandarizada. 
> El frontend debe acceder a la información a través de la propiedad **`data`** cuando `success === true`.

---

## 📐 Estructura Estándar de Respuesta

### Respuesta Exitosa (`200 OK`)
```json
{
  "data": { /* Payload del DTO solicitado */ },
  "success": true,
  "errorMessage": null
}
```

### Respuesta con Error (`400 Bad Request` / `404 Not Found`)
```json
{
  "data": null,
  "success": false,
  "errorMessage": "Descripción detallada del error de negocio o validación."
}
```

---

## 🆕 1. Nuevos Endpoints Incorporados

### 1.1 Consultar Disponibilidad de un Amenity (`CU-12`)
Retorna la grilla de slots de tiempo con su estado (`LIBRE`, `OCUPADO`, `MANTENIMIENTO`, `SUSPENDIDO`) y capacidad ocupada/máxima para una fecha dada.

* **HTTP Method**: `GET`
* **Ruta**: `/Amenity/{id}/Disponibilidad`
* **Query Params**:
  * `fechaDesde` / `fecha` (opcional, string formato `YYYY-MM-DD` — si se omite toma la fecha de hoy).
  * `fechaHasta` (opcional, string formato `YYYY-MM-DD`).
  * `idUnidadHabitacional` (opcional, entero — permite calcular `cupoRestanteUnidadMes`).
* **Ejemplo Request**: `GET /Amenity/1/Disponibilidad?fechaDesde=2026-07-31&fechaHasta=2026-07-31&idUnidadHabitacional=1`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idAmenity": 1,
    "nombreAmenity": "Piscina Principal",
    "estadoAmenity": "DISPONIBLE",
    "configuracion": {
      "horarioInicio": "09:00:00",
      "horarioFin": "22:00:00",
      "duracionBloqueMinutos": 60,
      "tiempoLimpiezaMinutos": 15,
      "tarifa": 0.00,
      "limiteReservasMesUnidad": 5,
      "requiereAprobacion": false
    },
    "ventanaConsultableDesde": "2026-07-31",
    "ventanaConsultableHasta": "2026-07-31",
    "cupoRestanteUnidadMes": 4,
    "dias": [
      {
        "fecha": "2026-07-31",
        "slots": [
          {
            "horaInicio": "09:00:00",
            "horaFin": "10:00:00",
            "disponible": true,
            "motivoNoDisponible": null
          },
          {
            "horaInicio": "10:15:00",
            "horaFin": "11:15:00",
            "disponible": false,
            "motivoNoDisponible": "OCUPADO"
          },
          {
            "horaInicio": "11:30:00",
            "horaFin": "12:30:00",
            "disponible": false,
            "motivoNoDisponible": "MANTENIMIENTO"
          }
        ]
      }
    ]
  },
  "success": true,
  "errorMessage": null
}
```

---

### 1.2 Cancelación Masiva por Amenity Fuera de Servicio (`CU-14`)
Declara un amenity fuera de servicio, cancelando automáticamente las reservas afectadas sin penalización (reembolso 100%) e inhabilitando las listas de espera.

* **HTTP Method**: `POST`
* **Ruta**: `/Amenity/{id}/FueraDeServicio`
* **Roles Permitidos**: `SUPER_ADMINISTRADOR`, `ADMINISTRADOR_AVANZADO`, `ADMINISTRADOR_LIVIANO`.
* **Payload Request (`Body JSON`)**:
```json
{
  "fechaDesde": "2026-07-30",
  "fechaHasta": "2026-08-05",
  "motivoAdmin": "Rotura imprevista de la bomba de filtrado",
  "cancelarReservasAfectadas": true
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idAmenity": 1,
    "nombreAmenity": "Piscina Principal",
    "nuevoEstadoAmenity": "FUERA_DE_SERVICIO",
    "reservasCanceladasCount": 4,
    "listasEsperaInhabilitadasCount": 2,
    "motivoAdmin": "Rotura imprevista de la bomba de filtrado",
    "fechaEjecucion": "2026-07-30T13:30:00Z"
  },
  "success": true,
  "errorMessage": null
}
```

---

### 1.3 Crear Reserva (`CU-01`)
Permite al residente solicitar una reserva enviando el contrato DTO simplificado (`ReservaRequestDto`). El backend valida automáticamente la disponibilidad, calcula `horaFin` en base a la duración del bloque de `AmenityConfig` y asigna el `estado` inicial.

* **HTTP Method**: `POST`
* **Ruta**: `/Reserva`
* **Roles Permitidos**: `INQUILINO`, `PROPIETARIO` (Grupo `RESIDENTE`), `ADMINISTRADOR_LIVIANO`, `ADMINISTRADOR_AVANZADO`, `SUPER_ADMINISTRADOR`.
* **Payload Request (`Body JSON`)**:
```json
{
  "idAmenity": 1,
  "idUnidadHabitacional": 1,
  "fechaUso": "2026-08-01",
  "horaInicio": "10:00:00",
  "cantidadInvitados": 0
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idReserva": 15,
    "idAmenity": 1,
    "nombreAmenity": "Piscina Principal",
    "idUnidadHabitacional": 1,
    "fechaUso": "2026-08-01",
    "horaInicio": "10:00:00",
    "horaFin": "11:00:00",
    "cantidadInvitados": 0,
    "estado": "CONFIRMADA",
    "fechaSolicitud": "2026-07-31T15:38:00Z",
    "montoRetenido": 0.00
  },
  "success": true,
  "errorMessage": null
}
```

---

### 1.4 Registro de Check-In en Reserva (`CU-01` Contingencia #1)
Permite al guardia o administrador registrar el ingreso físico a la reserva para evitar marcarla como No-Show.

* **HTTP Method**: `POST`
* **Ruta**: `/Reserva/{id}/CheckIn`
* **Roles Permitidos**: `GUARDIA`, `ADMINISTRADOR_LIVIANO`, `ADMINISTRADOR_AVANZADO`.
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idReserva": 12,
    "idAmenity": 1,
    "idUnidadHabitacional": 3,
    "fechaUso": "2026-07-30",
    "horaInicio": "14:00:00",
    "horaFin": "15:00:00",
    "cantidadInvitados": 2,
    "estado": "CONFIRMADA",
    "fechaSolicitud": "2026-07-29T10:00:00Z",
    "checkInRealizado": true,
    "checkInFecha": "2026-07-30T13:35:00Z",
    "montoRetenido": 0.00
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
  "errorMessage": "Solo se puede realizar Check-In sobre reservas en estado CONFIRMADA (Estado actual: CANCELADA)."
}
```

---

### 1.4 Retiro Voluntario de Lista de Espera (`CU-05`)
Permite al residente cancelar su lugar en la lista de espera antes de ser notificado o asignado.

* **HTTP Method**: `DELETE`
* **Ruta**: `/ListaEspera/{id}/RetiroVoluntario`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "idListaEspera": 5,
    "idAmenity": 1,
    "idUnidadHabitacional": 3,
    "idUsuario": 10,
    "fechaUso": "2026-07-30",
    "horaInicio": "16:00:00",
    "posicion": 1,
    "fechaInscripcion": "2026-07-29T11:00:00Z",
    "estado": "EXPIRADO",
    "fechaNotificacion": null,
    "fechaResolucion": "2026-07-30T13:36:00Z",
    "motivoExpiracion": "CANCELO"
  },
  "success": true,
  "errorMessage": null
}
```

---

### 1.5 Autenticación y Obtención de JWT Multi-Rol (`POST /Account/Login`)
Permite a cualquier usuario autenticarse mediante usuario/email y contraseña. Si las credenciales son válidas, devuelve el token JWT firmado con los claims de roles correspondientes y la lista de roles asignados en `PB_UsuarioRol`.

* **HTTP Method**: `POST`
* **Ruta**: `/Account/Login`
* **Cabecera HTTP requerida**: `Content-Type: application/json`
* **Payload Request (`Body JSON`)**:
```json
{
  "usuario": "seba",
  "password": "miPasswordSeguro123"
}
```
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiSU5RVUlMSU5PIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlBST1BJRVRBUklPIn0...",
    "expiration": "2026-08-04T12:30:00Z",
    "username": "seba",
    "roles": [
      "INQUILINO",
      "PROPIETARIO"
    ]
  },
  "success": true,
  "errorMessage": null
}
```
* **Respuesta Error de Credenciales (`401 Unauthorized`)**:
```json
{
  "message": "Usuario o contraseña incorrectos."
}
```

> 🔒 **Uso de la Cabecera de Autorización en el Frontend**:  
> Para consumir cualquier endpoint protegido, el Frontend debe incluir la cabecera HTTP:  
> `Authorization: Bearer <token>`

---

## ✏️ 2. Enmiendas en Modelos y Endpoints Existentes

### 2.1 Entidad `Reserva` (`GET /Reserva`, `POST /Reserva`, `GET /Reserva/{id}`)
Se agregan los campos `checkInRealizado`, `checkInFecha` y `montoRetenido` en la propiedad `data`:

```json
{
  "data": {
    "idReserva": 12,
    "idAmenity": 1,
    "idUnidadHabitacional": 3,
    "fechaUso": "2026-07-30",
    "horaInicio": "14:00:00",
    "horaFin": "15:00:00",
    "cantidadInvitados": 2,
    "estado": "CONFIRMADA", // "PENDIENTE_PAGO" | "PENDIENTE_APROBACION" | "CONFIRMADA" | "CANCELADA" | "CANCELADA_ADMINISTRATIVA"
    "fechaSolicitud": "2026-07-29T10:00:00Z",
    "checkInRealizado": false,  // 🆕 NUEVO (boolean)
    "checkInFecha": null,       // 🆕 NUEVO (datetime ISO UTC)
    "montoRetenido": 0.00       // 🆕 NUEVO (decimal retenido por penalización de cancelación)
  },
  "success": true,
  "errorMessage": null
}
```

---

### 2.2 Entidad `ListaEspera` (`GET /ListaEspera`, `POST /ListaEspera`)
Se agregan los campos `idUsuario`, `fechaNotificacion`, `fechaResolucion` y `motivoExpiracion`:

```json
{
  "data": {
    "idListaEspera": 5,
    "idAmenity": 1,
    "idUnidadHabitacional": 3,
    "idUsuario": 10,             // 🆕 NUEVO (FK int del usuario que se anotó)
    "fechaUso": "2026-07-30",
    "horaInicio": "16:00:00",
    "posicion": 1,
    "fechaInscripcion": "2026-07-29T11:00:00Z",
    "estado": "ESPERANDO",       // "ESPERANDO" | "NOTIFICADO" | "EXPIRADO" | "CONFIRMADO"
    "fechaNotificacion": null,   // 🆕 NUEVO (datetime ISO UTC cuando pasa a NOTIFICADO)
    "fechaResolucion": null,     // 🆕 NUEVO (datetime ISO UTC cuando pasa a CONFIRMADO o EXPIRADO)
    "motivoExpiracion": null     // 🆕 NUEVO: "NO_RESPONDIO" | "CANCELO" | "AMENITY_DESHABILITADO"
  },
  "success": true,
  "errorMessage": null
}
```

---

### 2.3 Entidad `Usuario` (Modelo Multi-Rol)
El sistema soporta asignación de múltiples roles por usuario a través de la tabla de catálogo `PB_Rol` y la tabla relacional `PB_UsuarioRol`. En la autenticación (`POST /Account/Login`), el servidor inyecta todos los roles activos del usuario como claims `ClaimTypes.Role` dentro del JWT, además de retornar un array `roles` en la respuesta JSON.

Los **7 roles estandarizados** del sistema son:

1. `"SUPER_ADMINISTRADOR"`: Acceso total cross-tenant y administración de consorcios.
2. `"ADMINISTRADOR_AVANZADO"`: Administración operativa y configuración completa del consorcio.
3. `"ADMINISTRADOR_LIVIANO"`: Gestión del día a día para consorcios sin guardia dedicado.
4. `"GUARDIA"`: Exclusivo para consorcios con guardia dedicado (check-in y reporte de incidencias).
5. `"PROPIETARIO"`: Miembro del grupo de residentes con supervisión de lectura sobre sus unidades.
6. `"INQUILINO"`: Residente operativo del día a día (reservas y uso de amenities).
7. `"INVITADO"`: Usuario temporal con vigencia acotada a una invitación.

> 🔑 **Políticas de Autorización (Authorization Policies)**:
> - **Policy `"RESIDENTE"`**: Otorga acceso si el usuario posee al menos uno de los roles `INQUILINO` o `PROPIETARIO`.
> - **Policy `"ADMINISTRADOR"`**: Otorga acceso si el usuario posee al menos uno de los roles `ADMINISTRADOR_AVANZADO` o `SUPER_ADMINISTRADOR`.

---

### 2.4 Entidad `Consorcio`
Se agrega la bandera de tipo de administración en la propiedad `data`:
```json
{
  "data": {
    "idConsorcio": 1,
    "nombre": "Consorcio Las Heras",
    "cuit": "30123456789",
    "email": "contacto@lasheras.com",
    "telefono": "1144332211",
    "tieneGuardiaDedicado": false  // 🆕 NUEVO (boolean)
  },
  "success": true,
  "errorMessage": null
}
```
