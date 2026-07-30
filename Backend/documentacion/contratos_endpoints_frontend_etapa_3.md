# Especificación de Contrato de API y Endpoints — Etapa 3 (Frontend Integration)

Base URL: `https://<tu-backend-domain>/` (o local `http://localhost:5000/`)

---

## 🆕 1. Nuevos Endpoints Incorporados

### 1.1 Consultar Disponibilidad de un Amenity (`CU-12`)
Retorna la grilla de slots de tiempo con su estado (`LIBRE`, `OCUPADO`, `MANTENIMIENTO`, `SUSPENDIDO`) y capacidad ocupada/máxima para una fecha dada.

* **HTTP Method**: `GET`
* **Ruta**: `/api/Amenity/{id}/Disponibilidad`
* **Query Params**:
  * `fecha` (opcional, string formato `YYYY-MM-DD` — si se omite toma la fecha de hoy).
* **Ejemplo Request**: `GET /api/Amenity/1/Disponibilidad?fecha=2026-07-30`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "idAmenity": 1,
  "nombreAmenity": "Piscina Principal",
  "fecha": "2026-07-30",
  "amenityHabilitado": true,
  "motivoInhabilitado": null,
  "slots": [
    {
      "horaInicio": "09:00:00",
      "horaFin": "10:00:00",
      "estadoSlot": "LIBRE",
      "capacidadMaxima": 15,
      "reservasConfirmadas": 2,
      "bloqueadoPorIncidencia": false,
      "bloqueadoPorMantenimiento": false
    },
    {
      "horaInicio": "10:15:00",
      "horaFin": "11:15:00",
      "estadoSlot": "OCUPADO",
      "capacidadMaxima": 15,
      "reservasConfirmadas": 15,
      "bloqueadoPorIncidencia": false,
      "bloqueadoPorMantenimiento": false
    },
    {
      "horaInicio": "11:30:00",
      "horaFin": "12:30:00",
      "estadoSlot": "MANTENIMIENTO",
      "capacidadMaxima": 15,
      "reservasConfirmadas": 0,
      "bloqueadoPorIncidencia": false,
      "bloqueadoPorMantenimiento": true
    }
  ]
}
```

---

### 1.2 Cancelación Masiva por Amenity Fuera de Servicio (`CU-14`)
Declara un amenity fuera de servicio, cancelando automáticamente las reservas afectadas sin penalización (reembolso 100%) e inhabilitando las listas de espera.

* **HTTP Method**: `POST`
* **Ruta**: `/api/Amenity/{id}/FueraDeServicio`
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
  "idAmenity": 1,
  "nombreAmenity": "Piscina Principal",
  "nuevoEstadoAmenity": "FUERA_DE_SERVICIO",
  "reservasCanceladasCount": 4,
  "listasEsperaInhabilitadasCount": 2,
  "motivoAdmin": "Rotura imprevista de la bomba de filtrado",
  "fechaEjecucion": "2026-07-30T13:30:00Z"
}
```

---

### 1.3 Registro de Check-In en Reserva (`CU-01` Contingencia #1)
Permite al guardia o administrador registrar el ingreso físico a la reserva para evitar marcarla como No-Show.

* **HTTP Method**: `POST`
* **Ruta**: `/Reserva/{id}/CheckIn`
* **Roles Permitidos**: `GUARDIA`, `ADMINISTRADOR_LIVIANO`, `ADMINISTRADOR_AVANZADO`.
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "mensaje": "Check-In registrado exitosamente.",
  "idReserva": 12,
  "checkInRealizado": true,
  "checkInFecha": "2026-07-30T13:35:00.123Z"
}
```
* **Respuesta Error (`400 Bad Request`)**: Si la reserva no está en estado `CONFIRMADA`.

---

### 1.4 Retiro Voluntario de Lista de Espera (`CU-05`)
Permite al residente cancelar su lugar en la lista de espera antes de ser notificado o asignado.

* **HTTP Method**: `DELETE`
* **Ruta**: `/ListaEspera/{id}/RetiroVoluntario`
* **Respuesta Exitosa (`200 OK`)**:
```json
{
  "mensaje": "Retiro voluntario de la lista de espera registrado exitosamente.",
  "idListaEspera": 5,
  "estado": "EXPIRADO",
  "motivoExpiracion": "CANCELO"
}
```

---

## ✏️ 2. Enmiendas en Modelos y Endpoints Existentes

### 2.1 Entidad `Reserva` (`GET /Reserva`, `POST /Reserva`, `GET /Reserva/{id}`)
Se agregan los siguientes campos en la respuesta JSON:

```json
{
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
}
```

---

### 2.2 Entidad `ListaEspera` (`GET /ListaEspera`, `POST /ListaEspera`)
Se agregan los siguientes campos en la respuesta JSON:

```json
{
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
}
```

---

### 2.3 Entidad `Usuario` (Modelo de 6 Roles)
El campo `rol` en el objeto `Usuario` o en los claims JWT retornados en Login acepta ahora los siguientes **6 valores estandarizados**:

1. `"SUPER_ADMINISTRADOR"`
2. `"ADMINISTRADOR_AVANZADO"`
3. `"ADMINISTRADOR_LIVIANO"`
4. `"GUARDIA"`
5. `"INQUILINO"`
6. `"PROPIETARIO"`
7. `"INVITADO"`

> **Nota para Frontend**: El claim `"RESIDENTE"` sigue funcionando como alias de (`INQUILINO` + `PROPIETARIO`) para vistas compartidas de reservas y amenities.

---

### 2.4 Entidad `Consorcio`
Se agrega la bandera de tipo de administración:
```json
{
  "idConsorcio": 1,
  "nombre": "Consorcio Las Heras",
  "cuit": "30123456789",
  "email": "contacto@lasheras.com",
  "telefono": "1144332211",
  "tieneGuardiaDedicado": false  // 🆕 NUEVO (boolean: si es false, habilita vista de ADMIN_LIVIANO para sustituir funciones de guardia)
}
```
