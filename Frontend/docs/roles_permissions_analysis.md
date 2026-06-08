# Análisis de Roles y Permisos — Amenities App

Este documento presenta una propuesta detallada para la estructura de usuarios y roles del sistema. Se evalúa la incorporación de la figura del **Superadmin** y cómo se relaciona con los roles existentes en el archivo [types/index.ts](file:///e:/JUANCHI/Portfolio/Amenities/ProyectoBase/Frontend/src/types/index.ts#L43).

---

## 1. El rol del Superadmin (Desarrolladores y Creadores)

> [!NOTE]
> Este rol está reservado exclusivamente para los **desarrolladores y creadores** de la aplicación. Permite realizar tareas de soporte técnico, monitoreo global de la infraestructura y administración de los diferentes consorcios/edificios (tenants) registrados en la plataforma.

Mientras que un **Admin** maneja la realidad de *un único consorcio o edificio*, el **Superadmin** tiene control global sobre la plataforma completa:

| Característica | Admin (Consorcio) | Superadmin (Plataforma) |
| :--- | :--- | :--- |
| **Ámbito** | Solo su edificio/consorcio asignado. | Toda la plataforma (multi-consorcio). |
| **Gestión de Edificios** | No puede crear ni editar otros edificios. | Crea, suspende y elimina consorcios en el sistema. |
| **Planes y Pagos** | Ve el estado de su suscripción. | Asigna planes, costos y gestiona la facturación SaaS. |
| **Soporte y Auditoría** | Resuelve incidentes locales. | Acceso a logs globales de auditoría para resolver fallas de sistema. |
| **Configuraciones Globales** | Ajustes del edificio (ej. horarios del SUM). | Configuración de APIs globales (SMS, Push notifications, email gateway). |

---

## 2. Jerarquía e Interacciones de Roles

El siguiente diagrama ilustra cómo se relacionan los diferentes roles de la aplicación:

```mermaid
graph TD
    Superadmin[Super Administrador <br/><i>(SaaS / Plataforma)</i>] -->|Crea y gestiona| Building[Consorcios / Edificios]
    Superadmin -->|Administra cuentas de| Admin[Administrador <br/><i>(Consorcio / Edificio)</i>]
    Admin -->|Gestiona e invita| Resident[Residente]
    Admin -->|Asigna tareas a| Maintenance[Personal de Mantenimiento]
    Admin -->|Monitorea y configura| Security[Personal de Seguridad]
    Resident -->|Reserva| Amenities[Amenities / Espacios]
    Resident -->|Reporta| Incidents[Incidentes]
    Security -->|Valida acceso en| Amenities
    Maintenance -->|Resuelve| Incidents
```

---

## 3. Matriz de Permisos Detallada

A continuación se presenta un desglose de qué acciones puede realizar cada rol en los módulos principales de la aplicación:

### Gestión de Consorcios y Edificios
* **Superadmin:** Crear consorcios, suspender accesos por falta de pago, ver métricas globales.
* **Admin / Seguridad / Mantenimiento / Residente:** Sin acceso (solo operan dentro de su consorcio asignado).

### Gestión de Amenities (`src/features/amenities`)
* **Superadmin:** Solo soporte técnico en caso de fallos.
* **Admin:** Crear, modificar y eliminar amenities (ej. SUM, Gimnasio, Parrilla), definir aforos y políticas de reserva.
* **Maintenance:** Bloquear temporalmente un amenity por roturas o mantenimiento.
* **Security:** Ver estado de ocupación actual.
* **Resident:** Ver amenities disponibles y leer reglamentos.

### Gestión de Reservas (`src/features/reservations`)
* **Superadmin:** Sin acceso (por privacidad de datos).
* **Admin:** Aprobar, rechazar, reprogramar o cancelar cualquier reserva del edificio.
* **Security:** Visualizar la planilla de reservas del día para control de ingresos de visitas.
* **Resident:** Crear reservas propias, cancelarlas antes del límite de tiempo y ver su historial de uso.
* **Maintenance:** Ver calendario de reservas para planificar limpiezas o arreglos en horas inactivas.

### Gestión de Incidentes (`src/features/incidents`)
* **Superadmin:** Soporte de segundo nivel si un archivo adjunto falla al cargar.
* **Admin:** Ver todos los incidentes del edificio, asignar prioridad, delegarlos a mantenimiento y dar el cierre formal.
* **Maintenance:** Ver incidentes asignados, cambiar estado a *En Progreso* / *Resuelto* y subir fotos del trabajo realizado.
* **Security:** Reportar incidentes de manera rápida durante rondas de vigilancia.
* **Resident:** Crear reportes de incidentes en áreas comunes y hacer seguimiento de los suyos.

---

## 4. Próximos pasos en el Código

Si decides incorporar el rol `superadmin`, te sugiero realizar los siguientes ajustes en el Frontend:

1. **Actualizar la definición del tipo `UserRole`** en [src/types/index.ts](file:///e:/JUANCHI/Portfolio/Amenities/ProyectoBase/Frontend/src/types/index.ts#L43):
   ```typescript
   export type UserRole = 'superadmin' | 'admin' | 'resident' | 'security' | 'maintenance';
   ```

2. **Middleware de Rutas de Next.js**:
   Implementar control de acceso en las rutas de la app. Los componentes del dashboard deberían renderizarse condicionalmente basándose en el rol del usuario autenticado.

---

## 5. Complejos sin Consorcio Formal (Casos Especiales)

Para complejos pequeños, co-livings o propiedades donde **no existe un consorcio formal** y una sola persona (dueño o vecino designado) se encarga de todo, sugerimos las siguientes estrategias:

### A. Abstracción conceptual de "Consorcio" a "Complejo"
En el backend y la base de datos, en lugar de estructurar todo bajo el nombre de `Consorcio`, se debe modelar bajo un término neutro como `Complejo`, `Propiedad` o `Tenant`. 
* Cada `Complejo` tiene sus propios amenities, unidades y residentes.
* Quien administre el lugar (sea un administrador profesional, el dueño directo o un vecino colaborador) simplemente ocupará el rol de `admin` asignado a ese `Complejo`.

### B. El Rol Dual (Admin + Residente)
En complejos autogestionados, la persona que administra también es un residente y necesita usar las instalaciones. Para no obligarlo a tener dos cuentas distintas:
* **Herencia de permisos:** El rol `admin` debe heredar todas las capacidades de un `resident`.
* **Switch de Modo (Recomendado):** Diseñar un selector en la UI (tipo Airbnb *"Cambiar a modo Administrador"* / *"Cambiar a modo Residente"*) para ocultar/mostrar las herramientas de gestión administrativa y no saturar la interfaz de uso diario.

### C. Automatización de Flujos
Para administradores que no operan a tiempo completo:
* **Auto-aprobación:** Configurar que las reservas de amenities se aprueben automáticamente bajo reglas predefinidas (ej. *"máximo 2 reservas activas por unidad"*), evitando que el administrador deba intervenir manualmente en cada reserva.
* **Alertas Simplificadas:** Enviar notificaciones solo de incidentes críticos o reservas que rompan reglas de convivencia.
