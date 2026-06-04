# Reglas de Negocio y Casos de Uso

Este documento define las reglas operativas y los flujos de interacción clave (Casos de Uso) para el sistema de alquiler y gestión de amenities.

---

## 📋 Reglas de Negocio (Business Rules)

### 1. Reservas, Prioridades y Horarios

*   **RN-01: Restricción por Expensas:** Ninguna unidad habitacional con saldo deudor (`debe_expensas = true`) podrá realizar nuevas reservas. Las reservas ya confirmadas antes de entrar en mora quedarán sujetas a la política del consorcio.
*   **RN-02: Prioridad de Uso Justo:** Si una unidad ya reservó el mismo amenity 2 o más veces en el mes en curso, su nueva solicitud queda en estado "Pendiente" por 24/48 hs. Si otra unidad con menos usos solicita el mismo horario en ese lapso, la prioridad pasa a esta última.
*   **RN-03: Límite de Reservas Activas:** Cada unidad puede tener un máximo de $X$ reservas activas (futuras) en total para evitar el acaparamiento de espacios.
*   **RN-04: Bloques Horarios Permitidos:** Los amenities se reservan en bloques fijos o configurables (ej. 1 hora para cancha, 6 hs para SUM). El sistema impide superposición horaria en el mismo amenity.
*   **RN-05: Margen de Cancelación sin Cargo:** El usuario puede cancelar sin penalización hasta $Y$ horas antes del turno. Pasado ese margen, se genera un cargo automático en el saldo de la unidad.
*   **RN-06: Antelación Mínima y Máxima:** Solo se pueden crear reservas con un mínimo de $H$ horas de anticipación y hasta un máximo de $D$ días a futuro.
*   **RN-07: Tiempo de Limpieza Obligatorio:** Entre reservas consecutivas de amenities con uso de alimentos (SUM, Parrilla), el sistema bloquea automáticamente un margen de $M$ minutos para limpieza del personal.
*   **RN-08: Restricciones de Horarios Operativos:** No se permiten reservas fuera del rango operativo de cada amenity, configurado por la administración (ej: piscina solo de 8:00 a 20:00 hs).
*   **RN-09: Sin Solapamiento de Reservas:** El sistema valida en tiempo real que no existan dos reservas activas superpuestas para el mismo amenity.
*   **RN-10: Bloqueo de Fechas Especiales:** El administrador puede bloquear días específicos (feriados, asambleas de consorcio) durante los cuales no estará habilitada ninguna reserva.
*   **RN-11: Reserva Inmutable una vez Confirmada:** Una reserva confirmada no puede modificarse. Para cambiar fecha u hora, el usuario debe cancelar y crear una nueva, respetando todas las validaciones.

---

### 2. Pagos, Tarifas y Depósitos de Garantía

*   **RN-12: Tarifas Diferenciadas por Amenity:** Existen amenities gratuitos (plaza de juegos) y arancelados (SUM, cancha de paddle con luz). La tarifa puede variar por día de la semana o franja horaria.
*   **RN-13: Métodos de Cobro (Pago Previo / Post-Cobro):**
    *   **Pago Previo:** La reserva queda en "Pendiente de Pago" y se cancela automáticamente si no se abona dentro de las $C$ horas de solicitada.
    *   **Post-Cobro:** El monto se carga automáticamente a la liquidación de expensas del próximo mes.
*   **RN-14: Depósito de Garantía Reembolsable:** Para amenities de eventos (SUM), se exige un depósito de garantía. Se devuelve en $T$ días hábiles, salvo que la administración reporte daños dentro de las 24 hs posteriores al uso.
*   **RN-15: Crédito por Cancelación Forzosa:** Si el consorcio cancela una reserva confirmada por incidencia o emergencia, la unidad recibe un reembolso completo o un crédito aplicable a futuras reservas aranceladas.
*   **RN-16: Comprobante de Pago:** El sistema emitirá automáticamente un comprobante digital (PDF/email) ante cualquier transacción de pago o reembolso registrada en la plataforma.

---

### 3. Mantenimiento e Incidencias

*   **RN-17: Bloqueo por Incidencia:** Al registrar una incidencia con estado "Abierta" o "En Reparación", el amenity cambia automáticamente a "Fuera de Servicio".
*   **RN-18: Cancelación en Cascada:** Al pasar a "Fuera de Servicio", todas las reservas futuras del amenity se cancelan automáticamente con notificación a los afectados y reembolso si corresponde (RN-15).
*   **RN-19: Rehabilitación Automática:** Al cambiar la incidencia a "Resuelta", el amenity vuelve automáticamente al estado "Disponible".
*   **RN-20: Mantenimiento Programado Preventivo:** El administrador puede configurar bloqueos recurrentes (ej: piscina cerrada todos los lunes 8:00-10:00 hs) sin necesidad de abrir una incidencia cada vez.
*   **RN-21: Historial de Mantenimiento:** Cada incidencia resuelta queda archivada con: fecha, descripción, tiempo de resolución y costo estimado de reparación, constituyendo un historial por amenity.
*   **RN-22: Escalado por Inactividad:** Si una incidencia lleva más de $N$ días sin resolverse, el sistema genera una alerta automática de escalado para el administrador del consorcio.

---

### 4. Convivencia, Sanciones y Roles

*   **RN-23: Suspensión Temporal de Unidad (Lista Negra):** La administración puede suspender temporal o permanentemente a una unidad por infracciones al reglamento. La unidad no puede reservar y sus reservas futuras activas son canceladas automáticamente.
*   **RN-24: Presencia Obligatoria del Anfitrión:** El residente que realizó la reserva debe estar presente durante el uso del amenity. Queda prohibido reservar para uso exclusivo de invitados externos.
*   **RN-25: Límites Diferenciados por Rol:** Los inquilinos temporales pueden tener restricciones más estrictas que los copropietarios (ej: menos reservas por mes, requerir aprobación del propietario titular para confirmar la reserva).
*   **RN-26: Acumulación de Infracciones:** El sistema lleva un contador de infracciones por unidad. Al alcanzar un umbral configurable (ej: 3 en 6 meses), notifica automáticamente al administrador para evaluar una sanción mayor.

---

### 5. Invitados y Aforo

*   **RN-27: Límite de Aforo Estricto:** La cantidad de invitados registrados en una reserva no puede superar la capacidad máxima del amenity. El sistema bloquea el registro si se intenta superar este valor.
*   **RN-28: Restricción por Historial Negativo del Invitado:** Los invitados con estado "Denegado" no podrán ser registrados como autorizados por ninguna unidad del consorcio.
*   **RN-29: Registro de Egreso de Invitados:** El sistema registra la hora de salida de cada invitado para tener trazabilidad completa de quién estuvo en el predio y durante cuánto tiempo.

---

### 6. Notificaciones y Comunicaciones

*   **RN-30: Recordatorio Previo a la Reserva:** El sistema envía una notificación (push y/o email) al usuario $X$ horas antes del inicio de su turno confirmado.
*   **RN-31: Notificación de Cancelación Automática:** Toda cancelación generada por el sistema (incidencia, mora, vencimiento de lista de espera) notifica al usuario afectado con el motivo específico.
*   **RN-32: Alerta de Turno Disponible:** Si un usuario está en lista de espera y el turno se libera, recibe una notificación en tiempo real para reclamar la reserva.
*   **RN-33: Comunicados Masivos del Administrador:** El administrador puede enviar avisos generales a todos los residentes del consorcio a través de la plataforma (ej: "Corte de agua el jueves").

---

### 7. Configuración y Administración del Sistema

*   **RN-34: Configuración Independiente por Amenity:** El administrador puede configurar de forma independiente para cada amenity: horario operativo, duración del bloque, tarifa, capacidad, tiempo de limpieza, límite de reservas por unidad/mes, y si requiere aprobación manual.
*   **RN-35: Flujo de Aprobación Manual de Reservas:** Algunos amenities pueden requerir que el administrador apruebe manualmente cada reserva antes de confirmarla. La reserva permanece en "Pendiente de Aprobación" hasta su resolución.
*   **RN-36: Soporte Multi-Consorcio:** Una misma cuenta administradora puede gestionar múltiples consorcios/complejos desde un panel centralizado, sin necesidad de cuentas separadas.
*   **RN-37: Amenities de Temporada:** Para espacios estacionales (ej: piscina habilitada solo de noviembre a marzo), el administrador configura rangos de fechas de activación/inactivación automática.

---

### 8. Reportes y Auditoría

*   **RN-38: Registro de Auditoría (Audit Log):** Toda acción crítica (crear/cancelar reserva, registrar incidencia, sancionar unidad, modificar configuración) queda registrada con: usuario responsable, fecha y hora exacta.
*   **RN-39: Reportes de Uso de Amenities:** El sistema genera reportes periódicos para el administrador con: tasa de ocupación, unidades con más reservas, incidencias recurrentes e ingresos generados por período.
*   **RN-40: Reporte de Morosidad en Tiempo Real:** El sistema muestra a la administración qué unidades tienen reservas activas pero han entrado en mora, para actuar de manera proactiva.

---

### 9. Seguridad y Gestión de Acceso al Sistema

*   **RN-41: Autenticación de Usuarios:** Cada residente accede con credenciales únicas (email + contraseña). Se recomienda implementar autenticación de doble factor (2FA) como opción disponible.
*   **RN-42: Roles y Permisos Diferenciados:** El sistema maneja al menos tres roles:
    *   **Residente/Inquilino:** Puede reservar, ver su historial, reportar incidencias y gestionar sus invitados.
    *   **Guardia/Recepción:** Solo puede consultar accesos y verificar invitados (solo lectura).
    *   **Administrador:** Acceso completo a configuración, sanciones, reportes y gestión de todos los amenities del consorcio.
*   **RN-43: Límite de Sesiones Activas:** Un usuario no puede tener sesión activa simultánea en más de $N$ dispositivos para evitar el uso compartido no autorizado de credenciales.
*   **RN-44: Revocación Automática de Acceso por Cambio de Inquilino:** Cuando un inquilino causa baja en la unidad, su acceso al sistema se revoca automáticamente. Las reservas pendientes quedan vinculadas a la unidad, no al usuario.

---

## ⚙️ Casos de Uso (Use Cases)

### CU-01: Reservar un Amenity
*   **Actor:** Inquilino / Propietario.
*   **Precondición:** El usuario tiene sesión iniciada, la unidad no tiene deudas y el amenity está "Disponible".
*   **Flujo Principal:**
    1. El usuario selecciona el amenity que desea reservar.
    2. El sistema muestra el calendario con bloques horarios disponibles.
    3. El usuario elige fecha/hora, declara la cantidad de invitados y confirma la solicitud.
    4. El sistema valida: RN-01 (expensas), RN-02 (prioridad), RN-03 (límite activas), RN-06 (antelación), RN-08 (horario operativo), RN-09 (solapamiento), RN-23 (suspensión), RN-27 (aforo).
    5. Si requiere pago previo (RN-13): el sistema redirige al flujo de pago → **CU-07**.
    6. Si requiere aprobación manual (RN-35): queda en "Pendiente de Aprobación".
    7. En caso contrario: la reserva se confirma automáticamente.
    8. El sistema envía notificación de confirmación (RN-30).

---

### CU-02: Reportar Incidencia en Amenity
*   **Actor:** Inquilino, Guardia o Administrador.
*   **Precondición:** El usuario detecta un daño o mal funcionamiento en el amenity.
*   **Flujo Principal:**
    1. El usuario ingresa a la sección del amenity y selecciona "Reportar Incidencia".
    2. Completa la descripción del daño y opcionalmente adjunta fotos.
    3. El sistema registra la incidencia con estado "Abierta".
    4. El sistema ejecuta RN-17 y RN-18: bloquea el amenity, cancela reservas futuras y, si aplica, genera reembolsos (RN-15).
    5. Se notifica al administrador y a los usuarios afectados (RN-31).

---

### CU-03: Control de Acceso de Invitados
*   **Actor:** Guardia de Seguridad / Recepción.
*   **Precondición:** Un invitado se presenta en el acceso del complejo.
*   **Flujo Principal:**
    1. El guardia solicita el DNI del visitante.
    2. El guardia ingresa el documento en el sistema.
    3. El sistema verifica: si está asociado a una unidad activa, si su estado es "Permitido" (RN-28), y opcionalmente si existe una reserva activa en ese rango horario.
    4. El sistema muestra: **Acceso Autorizado** (nombre de la unidad anfitriona) o **Acceso Denegado** (con motivo).
    5. El guardia registra la hora de ingreso.
    6. Al egreso, el guardia registra la hora de salida (RN-29).

---

### CU-04: Solucionar Incidencia y Rehabilitar Amenity
*   **Actor:** Administrador / Personal de Mantenimiento.
*   **Precondición:** Existe una incidencia en estado "Abierta" o "En Reparación".
*   **Flujo Principal:**
    1. El administrador ingresa al panel de incidencias.
    2. Selecciona la incidencia, cambia su estado a "Resuelta" y completa el detalle de trabajos realizados y costo estimado.
    3. El sistema archiva la incidencia en el historial del amenity (RN-21).
    4. El sistema aplica RN-19: el amenity vuelve automáticamente a "Disponible".
    5. El amenity reaparece en el calendario de reservas para todos los usuarios.

---

### CU-05: Entrar en Lista de Espera
*   **Actor:** Inquilino / Propietario.
*   **Precondición:** El bloque horario deseado del amenity ya está reservado por otra unidad.
*   **Flujo Principal:**
    1. El usuario selecciona el bloque horario ocupado y elige "Anotarse en Lista de Espera".
    2. El sistema añade al usuario a la cola de espera para ese turno.
    3. Si el reservante original cancela: el sistema notifica al primero en la lista (RN-32), quien tiene $T$ minutos para confirmar.
    4. Si confirma, se le asigna la reserva. Si no responde en tiempo, la reserva pasa al siguiente en la cola.

---

### CU-06: Sancionar Unidad Habitacional
*   **Actor:** Administrador.
*   **Precondición:** La administración recibe un reporte de infracción al reglamento de convivencia.
*   **Flujo Principal:**
    1. El administrador busca la unidad habitacional en el sistema.
    2. Registra la infracción (descripción y evidencia), incrementando el contador (RN-26).
    3. Si corresponde suspensión: define causa y duración, y selecciona "Suspender Unidad".
    4. El sistema aplica RN-23: cambia el estado de la unidad a "Suspendida" y cancela sus reservas futuras.
    5. Los residentes de la unidad reciben notificación con detalle y duración de la sanción (RN-31).

---

### CU-07: Realizar Pago de Reserva
*   **Actor:** Inquilino / Propietario.
*   **Precondición:** La reserva fue creada para un amenity arancelado con modalidad de pago previo (RN-13).
*   **Flujo Principal:**
    1. Tras crear la reserva, el sistema redirige al usuario a la pantalla de pago.
    2. El usuario selecciona el método de pago (tarjeta, transferencia, billetera digital).
    3. El sistema procesa el pago a través de la pasarela integrada.
    4. Si el pago es exitoso: la reserva cambia a "Confirmada" y se emite comprobante digital (RN-16).
    5. Si el pago falla o no se completa en el plazo $C$: la reserva se cancela automáticamente y el turno queda libre.

---

### CU-08: Registrar Nuevo Consorcio / Complejo
*   **Actor:** Administrador / Super-administrador.
*   **Precondición:** Se contrata el servicio para un nuevo edificio o barrio privado.
*   **Flujo Principal:**
    1. El administrador carga los datos del consorcio (CUIT, nombre, dirección, contacto).
    2. Registra el complejo asociado al consorcio (nombre, tipo, dirección).
    3. Carga las unidades habitacionales (departamentos, lotes).
    4. Crea y configura cada amenity del complejo (nombre, capacidad, horario, tarifa, etc.) según RN-34.
    5. Invita a los residentes por email para que creen sus cuentas y se asocien a su unidad.

---

### CU-09: Consultar Historial y Generar Reportes
*   **Actor:** Administrador.
*   **Precondición:** El administrador accede al panel de reportes.
*   **Flujo Principal:**
    1. El administrador selecciona el tipo de reporte: uso de amenities, morosidad, incidencias o ingresos generados.
    2. Filtra por rango de fechas, amenity o unidad habitacional específica.
    3. El sistema genera el reporte con las métricas solicitadas (RN-39, RN-40).
    4. El administrador puede exportar el reporte en formato PDF o Excel.

---

### CU-10: Configurar Mantenimiento Programado
*   **Actor:** Administrador.
*   **Precondición:** Se necesita bloquear un amenity de forma recurrente por mantenimiento preventivo.
*   **Flujo Principal:**
    1. El administrador selecciona el amenity y elige "Programar Mantenimiento".
    2. Define la recurrencia (ej: todos los lunes de 8:00 a 10:00 hs), la descripción y la fecha de fin de la programación.
    3. El sistema bloquea esos bloques en el calendario (RN-20), haciéndolos no reservables.
    4. Si ya existían reservas en esos horarios, el sistema las cancela y notifica a los afectados (RN-31, RN-15).

---

### CU-11: Dar de Baja un Inquilino / Cambio de Ocupante
*   **Actor:** Administrador / Propietario.
*   **Precondición:** Un inquilino se muda o finaliza su contrato de locación.
*   **Flujo Principal:**
    1. El administrador (o propietario) accede a la unidad y selecciona "Dar de Baja Inquilino".
    2. El sistema revoca el acceso del inquilino saliente de inmediato (RN-44).
    3. Las reservas activas vinculadas a la unidad permanecen asociadas a la unidad (no al usuario). La administración decide si cancelarlas o dejarlas disponibles para el nuevo ocupante.
    4. La lista de invitados de esa unidad queda disponible para ser revisada y depurada por el nuevo ocupante.
