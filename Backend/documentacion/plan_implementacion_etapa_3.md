# Plan de Implementación — Etapa 3

Se requiere implementar los cambios especificados en [implementacion_etapa_3.md](file:///C:/DesarrolloGIT/ProyectoBase/Backend/documentacion/implementacion_etapa_3.md) sobre el proyecto backend (.NET 10). Los cambios adaptan el backend actual (Etapa 2) hacia las especificaciones unificadas v2 (`specs-unificado.md`).

---

## Decisiones Técnicas y de Negocio

> [!IMPORTANT]
> **Migración de Autenticación y Roles**: La tabla `PB_Usuario` se extenderá con una propiedad `Rol` que soporta los 6 roles confirmados (`SUPER_ADMINISTRADOR`, `ADMINISTRADOR_AVANZADO`, `ADMINISTRADOR_LIVIANO`, `GUARDIA`, `INQUILINO`, `PROPIETARIO`, `INVITADO`). Se creará la tabla relacional `PB_UsuarioUnidad` para desacoplar a los usuarios de la tabla legacy `INQUILINO`.

> [!NOTE]
> **Compatibilidad de Claims**: El claim `"RESIDENTE"` se mantendrá en las políticas de autorización como alias dinámico para el grupo (`INQUILINO` + `PROPIETARIO`), evitando romper controladores existentes.

---

## Componentes y Cambios Propuestos

### 1. Entidades de Dominio (`Backend/Models/`)

#### [NEW] [UsuarioUnidad.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/UsuarioUnidad.cs)
- Entidad relacional N:M entre `Usuario` y `UnidadHabitacional` con propiedades `TipoRelacion` ("PROPIETARIO"/"INQUILINO") y `EsOcupanteActual`.

#### [NEW] [PoliticaCancelacionTramo.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/PoliticaCancelacionTramo.cs)
- Entidad para tramos de penalidad por anticipación de cancelación (`HorasAntesDesde`, `HorasAntesHasta`, `PorcentajePenalidad`).

#### [NEW] [NotificacionIntento.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/NotificacionIntento.cs)
- Entidad para registro de intentos de notificaciones multicanal (`Canal`, `EnviadoEn`, `Entregado`, `EntregadoEn`).

#### [MODIFY] [Usuario.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/Usuario.cs)
- Agregar propiedad `Rol` (`string`) con validaciones de 6 roles.

#### [MODIFY] [Consorcio.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/Consorcio.cs)
- Agregar propiedad `TieneGuardiaDedicado` (`bool`, default false).

#### [MODIFY] [Reserva.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/Reserva.cs)
- Agregar propiedades `CheckInRealizado` (`bool`), `CheckInFecha` (`DateTime?`), y `MontoRetenido` (`decimal`).

#### [MODIFY] [ListaEspera.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/ListaEspera.cs)
- Agregar `IDUsuario`, `FechaNotificacion`, `FechaResolucion`, `MotivoExpiracion`.

#### [MODIFY] [ApplicationDbContext.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Models/ApplicationDbContext.cs)
- Agregar `DbSet<UsuarioUnidad>`, `DbSet<PoliticaCancelacionTramo>`, `DbSet<NotificacionIntento>`.
- Configurar Fluent API (relaciones, índices, restricciones CHECK `CK_PoliticaCancelacion_Rango` y `CK_PoliticaCancelacion_Pct`).

---

### 2. DTOs y Servicios Core (`Backend/Services/` y `Backend/Controllers/`)

#### [NEW] [DisponibilidadService.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Services/DisponibilidadService.cs) & [DisponibilidadController.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Controllers/DisponibilidadController.cs)
- Implementación de `CU-12` (`GET /api/Amenity/{id}/Disponibilidad?fecha=YYYY-MM-DD`).
- Lógica para calcular franjas horarias libres/ocupadas evaluando `AmenityConfig`, suspensiones por `Incidencia` o `MantenimientoProgramado`, y deudas (`DebeExpensas`).

#### [NEW] [CancelacionMasivaService.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Services/CancelacionMasivaService.cs) & [CancelacionMasivaController.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Controllers/CancelacionMasivaController.cs)
- Implementación de `CU-14` (`POST /api/Amenity/{id}/FueraDeServicio`).
- Transacción explícita para cancelar reservas confirmadas en masa, reembolsar sin penalización e inhabilitar listas de espera.

#### [MODIFY] [ReservaController.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Controllers/ReservaController.cs)
- Agregar endpoint `POST /api/Reserva/{id}/CheckIn` (para Guardia/Admin).

#### [MODIFY] [ListaEsperaController.cs](file:///C:/DesarrolloGIT/ProyectoBase/Backend/Controllers/ListaEsperaController.cs)
- Agregar endpoint `DELETE /api/ListaEspera/{id}` (retiro voluntario).

---

### 3. Migraciones EF Core (`Backend/Migrations/`)

#### [NEW] `007_Etapa3_Entidades_v2.cs`
- Migración de EF Core para aplicar los cambios de esquema en PostgreSQL / Supabase (`PB_UsuarioUnidad`, `PB_PoliticaCancelacionTramo`, `PB_NotificacionIntento`, y columnas adicionales).

---

## Verificación
1. **Compilación de solución**: `dotnet build` en `Backend/ProyectoBase.slnx`.
2. **Pruebas unitarias**: `dotnet test` en `Backend/ProyectoBase.Tests/`.
3. Verificación de comandos `dotnet ef migrations add`.
