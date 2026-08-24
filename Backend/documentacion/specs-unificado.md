# specs.md v2 — Spec-Driven Development (SDD)
## Sistema de Gestión de Consorcios y Amenities
**Stack:** .NET 10 · EF Core 10 · PostgreSQL · Npgsql · Clean N-Layer (ProyectoBase)
**Table prefix:** `PB_` · **DI:** Scoped · **Response envelope:** `ServiceResponse<T>` / `PagedResponse<T>`
**Tests:** xUnit + Moq + FluentAssertions

> **Instrucción para el agente:** buscar el `SPEC-ID` del feature solicitado, leer sus secciones en orden, implementar sin interpretación adicional. Cada campo, constraint y nombre de archivo es definitivo.

---

## ÍNDICE

| SPEC-ID | Feature | Estado | Depende de | Migración |
|---|---|---|---|---|
| [SPEC-ARCH](#spec-arch) | Arquitectura, convenciones y trinomio genérico | ✅ | — | 001 |
| [SPEC-ENT](#spec-ent) | Entidades de dominio + Fluent API completa | ✅ CU08 / 🔲 resto | SPEC-ARCH | 002 |
| [SPEC-CU08](#spec-cu08) | Onboarding Consorcio/Complejo/Amenity | ✅ | SPEC-ENT | 002 |
| [SPEC-CU12](#spec-cu12) | Consultar Disponibilidad de Amenity | 🔲 | SPEC-ENT, SPEC-CU08, SPEC-AUTH | 002b |
| [SPEC-CU01](#spec-cu01) | Reservar Amenity | 🔲 | SPEC-ENT, SPEC-CU08 | 003 |
| [SPEC-CU02](#spec-cu02) | Reportar Incidencia | 🔲 | SPEC-ENT | 003 |
| [SPEC-CU04](#spec-cu04) | Resolver Incidencia / Rehabilitar Amenity | 🔲 | SPEC-CU02 | — |
| [SPEC-CU03](#spec-cu03) | Control de Acceso de Invitados | 🔲 | SPEC-ENT | 004 |
| [SPEC-CU05](#spec-cu05) | Lista de Espera (ampliado: hold + expiración + fair-use) | 🔲 | SPEC-CU01, SPEC-CU12 | 005 + 002b |
| [SPEC-CU06](#spec-cu06) | Sancionar Unidad Habitacional | 🔲 | SPEC-ENT | — |
| [SPEC-CU07](#spec-cu07) | Pago de Reserva | 🔲 | SPEC-CU01 | — |
| [SPEC-CU09](#spec-cu09) | Reportes y Auditoría (+ EventoAuditoria) | 🔲 | SPEC-ENT | 006 + 006b |
| [SPEC-CU10](#spec-cu10) | Mantenimiento Programado (+ DiaExcepcional/feriados) | 🔲 | SPEC-ENT | 007 |
| [SPEC-CU14](#spec-cu14) | Cancelación Masiva por Fuera de Servicio | 🔲 | SPEC-CU01, SPEC-CU05, SPEC-CU10 | — |
| [SPEC-CU11](#spec-cu11) | Baja Inquilino / Cambio Ocupante | 🔲 | SPEC-ENT | — |
| [SPEC-NOTIF](#spec-notif) | Notificaciones (Port & Adapter) | 🔲 | SPEC-CU01, SPEC-CU02 | — |
| [SPEC-AUTH (v2)](#spec-auth-v2) | Autenticación, 6 Roles, UsuarioUnidad, JWT | 🔲 | SPEC-ENT | 008 + 008b |

---

---

## SPEC-ARCH
### Arquitectura Base y Convenciones Globales

#### Capas y flujo de dependencias
```
[Cliente HTTP]
  → GlobalErrorHandlingMiddleware
  → Controller : GenericControllerAsync<T>   (o controller propio para orquestadores)
  → IServiceAsync<T> : ServiceAsync<T>       (o IXxxService propio)
  → IRepositoryAsync<T> : RepositoryAsync<T>
  → ApplicationDbContext → PostgreSQL
```

#### Reglas de oro — el agente NO debe violarlas

| # | Regla |
|---|---|
| 1 | Toda tabla: `entity.ToTable("PB_NombreEntidad")` en Fluent API. Clase C# sin prefijo. |
| 2 | Cero `DataAnnotations` en entidades. Todas las constraints en `OnModelCreating`. |
| 3 | Todo servicio, repo y adapter: `builder.Services.AddScoped<Interface, Impl>()`. |
| 4 | Todo endpoint retorna `Ok(new ServiceResponse<T>(data))` o lanza excepción de dominio. |
| 5 | Error de negocio: `throw new BadRequestException("[BR-ID] Mensaje.")` desde el servicio. |
| 6 | No encontrado: `throw new NotFoundException("Mensaje.")` desde el servicio. |
| 7 | El middleware convierte `BadRequestException→400`, `NotFoundException→404`, resto→500. |
| 8 | El registro genérico abierto ya resuelve CRUD simple: `services.AddScoped(typeof(IServiceAsync<>), typeof(ServiceAsync<>))`. Sólo registrar explícitamente servicios específicos/orquestadores. |
| 9 | Servicios con lógica extra heredan `ServiceAsync<T>` y sobrescriben `Create`/`Update`. |
| 10 | Casos de uso multi-entidad: servicio orquestador propio (NO hereda `ServiceAsync<T>`), con `IDbContextTransaction` explícita. |

#### Convención de nombrado de BRs

```
BR-{MÓDULO}-{NNN}   →   [BR-ONB-001], [BR-RES-001], etc.
Formato en errorMessage: "[BR-ID] Oración descriptiva en español."
```

| Prefijo | Módulo |
|---|---|
| `BR-ONB-` | Onboarding (CU-08) |
| `BR-RES-` | Reservas (CU-01) |
| `BR-DISP-` | Consultar Disponibilidad (CU-12) |
| `BR-INC-` | Incidencias (CU-02 / CU-04) |
| `BR-ACC-` | Acceso de Invitados (CU-03) |
| `BR-ESP-` | Lista de Espera (CU-05) |
| `BR-SAN-` | Sanciones (CU-06) |
| `BR-PAG-` | Pagos (CU-07) |
| `BR-AUD-` | Auditoría / Reportes (CU-09) |
| `BR-MAN-` | Mantenimiento Programado (CU-10) + Cancelación Masiva (CU-14, `BR-MAN-005..007`) |
| `BR-BAJ-` | Baja Inquilino (CU-11) |
| `BR-NOT-` | Notificaciones |
| `BR-AUTH-` | Autenticación y Roles |
| `RT-` | Reglas técnicas de implementación (no son BR de negocio — locks, rate limiting) |

#### Formato de respuesta estándar
```json
{ "data": {}, "success": true,  "errorMessage": null }
{ "data": null, "success": false, "errorMessage": "[BR-ID] Mensaje." }
{ "data": { "data":[], "page":1, "limit":10, "totalRows":N, "totalPage":M }, "success": true, "errorMessage": null }
```

#### Convención de migrations

```powershell
dotnet ef migrations add {NombreMigration} --output-dir Migrations
dotnet ef migrations script --output "scripts/{NNN}_{NombreMigration}.sql" --idempotent
dotnet ef database update
```
Numeración: `001_InitialCreate`, `002_CU08_OnboardingDomain`, `003_CU01_CU02_ReservaIncidencia`, …

#### Pattern Port & Adapter (para todos los servicios externos)
```
Core define interface:        Services/Ports/IXxxPort.cs
Infra implementa:             Infrastructure/Adapters/XxxAdapter.cs
Registro en Program.cs:       builder.Services.AddScoped<IXxxPort, XxxAdapter>();
```

---

---

## SPEC-ENT
### Entidades de Dominio — POCOs + Fluent API Completa

> El agente debe agregar cada bloque de `DbSet` y `OnModelCreating` en `ApplicationDbContext.cs` al momento de implementar el SPEC-ID correspondiente.

---

### ENT-01 · Consorcio · (CU-08)
```csharp
// Models/Consorcio.cs
public class Consorcio {
    public int    IDConsorcio { get; set; }
    public string Cuit        { get; set; }   // 11 dígitos, único global
    public string Nombre      { get; set; }
    public string Email       { get; set; }   // único global
    public string Telefono    { get; set; }   // nullable
    // --- ENMIENDA contingencia #8 (timezone/feriados) ---
    public string TimeZoneId  { get; set; }   // IANA, ej. "America/Argentina/Buenos_Aires"; seed en CU-08
    // --- ENMIENDA contingencia #4 (doble reserva simultánea, opt-in) ---
    public bool   RestringeReservasSimultaneas { get; set; } // default false
    // --- ENMIENDA SPEC-AUTH v2 (liviano/avanzado, condiciona CU-03) ---
    public bool   TieneGuardiaDedicado { get; set; } // default false; ver BR-AUTH-014/015
}
```
```csharp
// ApplicationDbContext — Fluent API
modelBuilder.Entity<Consorcio>(e => {
    e.ToTable("PB_Consorcio");
    e.HasKey(x => x.IDConsorcio);
    e.Property(x => x.Cuit).IsRequired().HasMaxLength(11);
    e.HasIndex(x => x.Cuit).IsUnique();
    e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
    e.Property(x => x.Email).IsRequired().HasMaxLength(100);
    e.HasIndex(x => x.Email).IsUnique();
    e.Property(x => x.Telefono).HasMaxLength(20);
    e.Property(x => x.TimeZoneId).IsRequired().HasMaxLength(50).HasDefaultValue("America/Argentina/Buenos_Aires");
    e.Property(x => x.RestringeReservasSimultaneas).HasDefaultValue(false);
    e.Property(x => x.TieneGuardiaDedicado).HasDefaultValue(false);
});
```

---

### ENT-02 · Complejo · (CU-08)
```csharp
// Models/Complejo.cs
public class Complejo {
    public int    IDComplejo  { get; set; }
    public int    IDConsorcio { get; set; }   // FK → Consorcio
    public string Nombre      { get; set; }
    public string Tipo        { get; set; }   // "EDIFICIO" | "BARRIO_PRIVADO"
    public string Direccion   { get; set; }
    public Consorcio Consorcio { get; set; }
}
```
```csharp
modelBuilder.Entity<Complejo>(e => {
    e.ToTable("PB_Complejo");
    e.HasKey(x => x.IDComplejo);
    e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
    e.HasIndex(x => new { x.IDConsorcio, x.Nombre }).IsUnique();
    e.Property(x => x.Tipo).IsRequired().HasMaxLength(20);
    e.Property(x => x.Direccion).IsRequired().HasMaxLength(200);
    e.HasOne(x => x.Consorcio).WithMany()
     .HasForeignKey(x => x.IDConsorcio).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-03 · UnidadHabitacional · (CU-08)
```csharp
// Models/UnidadHabitacional.cs
public class UnidadHabitacional {
    public int     IDUnidadHabitacional { get; set; }
    public int     IDComplejo           { get; set; }   // FK → Complejo
    public string  Identificador        { get; set; }   // "1A", "Lote 42"
    public bool    DebeExpensas         { get; set; }   // default: false
    public decimal SaldoActual          { get; set; }   // default: 0.00
    public string  EstadoUnidad         { get; set; }   // "ACTIVA" | "SUSPENDIDA"  default: "ACTIVA"
    public int     ContadorInfracciones { get; set; }   // default: 0
    // --- ENMIENDA contingencia #1 (no-show) ---
    public int      ContadorNoShow                    { get; set; } // default 0
    // --- ENMIENDA contingencia #3 (ban lista de espera) ---
    public int       ContadorNoRespondioListaEspera { get; set; } // default 0
    public DateTime? BloqueadaListaEsperaHasta      { get; set; }  // null = sin bloqueo activo
    // --- ENMIENDA SPEC-AUTH v2 (RN-25, aprobación del propietario) ---
    public bool      RequiereAprobacionPropietario  { get; set; } // default false
    public Complejo Complejo            { get; set; }
}
```
```csharp
modelBuilder.Entity<UnidadHabitacional>(e => {
    e.ToTable("PB_UnidadHabitacional");
    e.HasKey(x => x.IDUnidadHabitacional);
    e.Property(x => x.Identificador).IsRequired().HasMaxLength(20);
    e.HasIndex(x => new { x.IDComplejo, x.Identificador }).IsUnique();
    e.Property(x => x.DebeExpensas).HasDefaultValue(false);
    e.Property(x => x.SaldoActual).HasColumnType("decimal(12,2)").HasDefaultValue(0.00m);
    e.Property(x => x.EstadoUnidad).IsRequired().HasMaxLength(15).HasDefaultValue("ACTIVA");
    e.Property(x => x.ContadorInfracciones).HasDefaultValue(0);
    e.Property(x => x.ContadorNoShow).HasDefaultValue(0);
    e.Property(x => x.ContadorNoRespondioListaEspera).HasDefaultValue(0);
    e.Property(x => x.RequiereAprobacionPropietario).HasDefaultValue(false);
    e.HasOne(x => x.Complejo).WithMany()
     .HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-04 · Amenity · (CU-08)
```csharp
// Models/Amenity.cs
public class Amenity {
    public int    IDAmenity  { get; set; }
    public int    IDComplejo { get; set; }   // FK → Complejo
    public string Nombre     { get; set; }
    public int    Capacidad  { get; set; }   // min: 1
    public string Estado     { get; set; }   // "DISPONIBLE" | "FUERA_DE_SERVICIO"  default: "DISPONIBLE"
    public Complejo      Complejo { get; set; }
    public AmenityConfig Config   { get; set; }
}
```
```csharp
modelBuilder.Entity<Amenity>(e => {
    e.ToTable("PB_Amenity");
    e.HasKey(x => x.IDAmenity);
    e.Property(x => x.Nombre).IsRequired().HasMaxLength(50);
    e.HasIndex(x => new { x.IDComplejo, x.Nombre }).IsUnique();
    e.Property(x => x.Capacidad).IsRequired();
    e.Property(x => x.Estado).IsRequired().HasMaxLength(20).HasDefaultValue("DISPONIBLE");
    e.HasOne(x => x.Complejo).WithMany()
     .HasForeignKey(x => x.IDComplejo).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-05 · AmenityConfig · (CU-08 — RN-34)
```csharp
// Models/AmenityConfig.cs
public class AmenityConfig {
    public int      IDAmenityConfig         { get; set; }
    public int      IDAmenity               { get; set; }   // FK → Amenity (1:1)
    public TimeOnly HorarioInicio           { get; set; }
    public TimeOnly HorarioFin              { get; set; }   // constraint: > HorarioInicio
    public int      DuracionBloqueMinutos   { get; set; }   // min: 1
    public int      TiempoLimpiezaMinutos   { get; set; }   // min: 0; < DuracionBloqueMinutos; default: 0
    public decimal  Tarifa                  { get; set; }   // min: 0; default: 0.00
    public int      LimiteReservasMesUnidad { get; set; }   // min: 1
    public bool     RequiereAprobacion      { get; set; }   // default: false
    // --- ENMIENDA CU-12 (BR-RES-005 ya las referenciaba sin que existieran) ---
    public int      MinAdvanceHours         { get; set; }   // min: 0; anticipación mínima. Ej: 1 (pádel) | 48 (quincho)
    public int      MaxAdvanceDays          { get; set; }   // min: 1; horizonte máximo. Ej: 7 (pádel) | 30 (quincho)
    // --- ENMIENDA CU-05 (ampliado) ---
    public int      TiempoLimiteConfirmacionMinutos   { get; set; } // default 30; ventana del hold en lista de espera
    public int      MaxPosicionesListaEsperaPorUnidad { get; set; } // default 3; evita acaparar filas
    public bool     PermiteListaEsperaMismoDia        { get; set; } // default true
    public Amenity  Amenity                 { get; set; }
}
```
```csharp
modelBuilder.Entity<AmenityConfig>(e => {
    e.ToTable("PB_AmenityConfig");
    e.HasKey(x => x.IDAmenityConfig);
    e.HasIndex(x => x.IDAmenity).IsUnique();
    e.Property(x => x.HorarioInicio).IsRequired().HasColumnType("time");
    e.Property(x => x.HorarioFin).IsRequired().HasColumnType("time");
    e.Property(x => x.DuracionBloqueMinutos).IsRequired();
    e.Property(x => x.TiempoLimpiezaMinutos).HasDefaultValue(0);
    e.Property(x => x.Tarifa).HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
    e.Property(x => x.LimiteReservasMesUnidad).IsRequired();
    e.Property(x => x.RequiereAprobacion).HasDefaultValue(false);
    e.Property(x => x.MinAdvanceHours).IsRequired().HasDefaultValue(1);
    e.Property(x => x.MaxAdvanceDays).IsRequired().HasDefaultValue(30);
    e.Property(x => x.TiempoLimiteConfirmacionMinutos).IsRequired().HasDefaultValue(30);
    e.Property(x => x.MaxPosicionesListaEsperaPorUnidad).IsRequired().HasDefaultValue(3);
    e.Property(x => x.PermiteListaEsperaMismoDia).IsRequired().HasDefaultValue(true);
    e.HasOne(x => x.Amenity).WithOne(x => x.Config)
     .HasForeignKey<AmenityConfig>(x => x.IDAmenity).OnDelete(DeleteBehavior.Cascade);
});
```

**Impacto en migraciones (`002b`):**
- Si `002_CU08_OnboardingDomain` **todavía no corrió en ningún ambiente** → editar el entity original y regenerar la migración 002.
- Si **ya corrió** (hay datos) → nueva migración de alteración antes de CU-12/CU-05:
```powershell
dotnet ef migrations add ENT05_AmenityConfig_VentanaYListaEspera --output-dir Migrations
dotnet ef migrations script --output "scripts/002b_AmenityConfig_VentanaYListaEspera.sql" --idempotent
```

---

### ENT-06 · Inquilino · (CU-11)
```csharp
// Models/Inquilino.cs
public class Inquilino {
    public int    IDInquilino          { get; set; }
    public int    IDUnidadHabitacional { get; set; }   // FK → UnidadHabitacional
    public string Nombre               { get; set; }
    public string Apellido             { get; set; }
    public string Dni                  { get; set; }
    public string Telefono             { get; set; }   // nullable
    public bool   Activo               { get; set; }   // default: true; false = dado de baja
    public UnidadHabitacional UnidadHabitacional { get; set; }
}
```
```csharp
modelBuilder.Entity<Inquilino>(e => {
    e.ToTable("PB_Inquilino");
    e.HasKey(x => x.IDInquilino);
    e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
    e.Property(x => x.Apellido).IsRequired().HasMaxLength(100);
    e.Property(x => x.Dni).IsRequired().HasMaxLength(20);
    e.HasIndex(x => x.Dni).IsUnique();
    e.Property(x => x.Telefono).HasMaxLength(20);
    e.Property(x => x.Activo).HasDefaultValue(true);
    e.HasOne(x => x.UnidadHabitacional).WithMany()
     .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-07 · Invitado · (CU-03)
```csharp
// Models/Invitado.cs
public class Invitado {
    public int      IDInvitado           { get; set; }
    public int      IDUnidadHabitacional { get; set; }   // FK → UnidadHabitacional
    public string   Nombre               { get; set; }
    public string   Apellido             { get; set; }
    public string   Dni                  { get; set; }
    public string   EstadoAcceso         { get; set; }   // "PERMITIDO" | "DENEGADO"  default: "PERMITIDO"
    public DateTime? HoraIngreso         { get; set; }   // nullable; se completa al ingresar
    public DateTime? HoraEgreso          { get; set; }   // nullable; se completa al egresar (RN-29)
    public UnidadHabitacional UnidadHabitacional { get; set; }
}
```
```csharp
modelBuilder.Entity<Invitado>(e => {
    e.ToTable("PB_Invitado");
    e.HasKey(x => x.IDInvitado);
    e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
    e.Property(x => x.Apellido).IsRequired().HasMaxLength(100);
    e.Property(x => x.Dni).IsRequired().HasMaxLength(20);
    e.Property(x => x.EstadoAcceso).IsRequired().HasMaxLength(15).HasDefaultValue("PERMITIDO");
    e.Property(x => x.HoraIngreso).HasColumnType("timestamptz");
    e.Property(x => x.HoraEgreso).HasColumnType("timestamptz");
    e.HasOne(x => x.UnidadHabitacional).WithMany()
     .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-08 · Reserva · (CU-01)
```csharp
// Models/Reserva.cs
public class Reserva {
    public int      IDReserva            { get; set; }
    public int      IDAmenity            { get; set; }   // FK → Amenity
    public int      IDUnidadHabitacional { get; set; }   // FK → UnidadHabitacional
    public DateOnly FechaUso             { get; set; }
    public TimeOnly HoraInicio           { get; set; }
    public TimeOnly HoraFin              { get; set; }   // calculado: HoraInicio + DuracionBloqueMinutos
    public int      CantidadInvitados    { get; set; }   // default: 0
    public string   Estado               { get; set; }
    // Estados: "PENDIENTE_PAGO" | "PENDIENTE_APROBACION" | "PendienteAprobacionPropietario"
    //        | "CONFIRMADA" | "CANCELADA" | "EN_ESPERA" | "NoAsistio"
    public DateTime FechaSolicitud       { get; set; }   // UTC; set en el servicio
    // --- ENMIENDA contingencia #1 (no-show) ---
    public bool      CheckInRealizado { get; set; }   // default false; lo marca GUARDIA/ADMIN al ingreso
    public DateTime? CheckInFecha     { get; set; }    // UTC
    // --- ENMIENDA contingencia #2 (cancelación escalonada) ---
    public decimal   MontoRetenido    { get; set; }    // default 0; calculado por BR-RES-015..017
    public Amenity            Amenity            { get; set; }
    public UnidadHabitacional UnidadHabitacional { get; set; }
}
```
```csharp
modelBuilder.Entity<Reserva>(e => {
    e.ToTable("PB_Reserva");
    e.HasKey(x => x.IDReserva);
    e.Property(x => x.FechaUso).IsRequired().HasColumnType("date");
    e.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
    e.Property(x => x.HoraFin).IsRequired().HasColumnType("time");
    e.Property(x => x.CantidadInvitados).HasDefaultValue(0);
    e.Property(x => x.Estado).IsRequired().HasMaxLength(30);
    e.Property(x => x.FechaSolicitud).IsRequired().HasColumnType("timestamptz");
    e.Property(x => x.CheckInRealizado).IsRequired().HasDefaultValue(false);
    e.Property(x => x.MontoRetenido).HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
    e.HasOne(x => x.Amenity).WithMany()
     .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
    e.HasOne(x => x.UnidadHabitacional).WithMany()
     .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
});
```

**Endpoint nuevo:** `POST /Reserva/{id}/CheckIn` `[Authorize(Roles="GUARDIA,ADMINISTRADOR_LIVIANO,ADMINISTRADOR_AVANZADO")]` → marca `CheckInRealizado = true`, `CheckInFecha = UtcNow`; `BadRequestException` si `Estado != "Confirmed"` o fuera de `[HoraInicio - 15min, HoraFin]`.
**Job:** `RecurringJob.AddOrUpdate<NoShowDetectionJob>("no-show-detection", job => job.Ejecutar(), "*/15 * * * *");`

**Entidad nueva — `PoliticaCancelacionTramo` (contingencia #2):**
```csharp
public class PoliticaCancelacionTramo {
    public int      IDTramo             { get; set; }
    public int?     IDAmenityConfig     { get; set; }  // FK nullable → null = política global del tenant
    public int      HorasAntesDesde     { get; set; }
    public int      HorasAntesHasta     { get; set; }  // constraint: > HorasAntesDesde
    public decimal  PorcentajePenalidad { get; set; }  // 0-100
    public AmenityConfig? AmenityConfig { get; set; }
}
```
```csharp
modelBuilder.Entity<PoliticaCancelacionTramo>(e => {
    e.ToTable("PB_PoliticaCancelacionTramo");
    e.HasKey(x => x.IDTramo);
    e.Property(x => x.PorcentajePenalidad).HasColumnType("decimal(5,2)");
    e.HasCheckConstraint("CK_PoliticaCancelacion_Rango", "\"HorasAntesHasta\" > \"HorasAntesDesde\"");
    e.HasCheckConstraint("CK_PoliticaCancelacion_Pct", "\"PorcentajePenalidad\" BETWEEN 0 AND 100");
    e.HasOne(x => x.AmenityConfig).WithMany().HasForeignKey(x => x.IDAmenityConfig).OnDelete(DeleteBehavior.Cascade);
});
```
Endpoints: `GET/PUT /Amenity/{id}/PoliticaCancelacion` (admin consulta/edita tramos).

---

### ENT-09 · Incidencia · (CU-02)
```csharp
// Models/Incidencia.cs
public class Incidencia {
    public int      IDIncidencia         { get; set; }
    public int      IDAmenity            { get; set; }   // FK → Amenity
    public int      IDUnidadHabitacional { get; set; }   // FK → UnidadHabitacional (quién reporta)
    public string   Descripcion          { get; set; }
    public string   Estado               { get; set; }   // "ABIERTA" | "EN_REPARACION" | "RESUELTA"
    public string   DetalleResolucion    { get; set; }   // nullable; se completa al resolver (CU-04)
    public decimal? CostoEstimado        { get; set; }   // nullable; se completa al resolver (CU-04)
    public DateTime FechaReporte         { get; set; }   // UTC
    public DateTime? FechaResolucion     { get; set; }   // nullable; UTC; set al resolver
    public Amenity            Amenity            { get; set; }
    public UnidadHabitacional UnidadHabitacional { get; set; }
}
```
```csharp
modelBuilder.Entity<Incidencia>(e => {
    e.ToTable("PB_Incidencia");
    e.HasKey(x => x.IDIncidencia);
    e.Property(x => x.Descripcion).IsRequired().HasMaxLength(500);
    e.Property(x => x.Estado).IsRequired().HasMaxLength(20);
    e.Property(x => x.DetalleResolucion).HasMaxLength(500);
    e.Property(x => x.CostoEstimado).HasColumnType("decimal(10,2)");
    e.Property(x => x.FechaReporte).IsRequired().HasColumnType("timestamptz");
    e.Property(x => x.FechaResolucion).HasColumnType("timestamptz");
    e.HasOne(x => x.Amenity).WithMany()
     .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
    e.HasOne(x => x.UnidadHabitacional).WithMany()
     .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-10 · ListaEspera · (CU-05)
```csharp
// Models/ListaEspera.cs
public class ListaEspera {
    public int      IDListaEspera        { get; set; }
    public int      IDAmenity            { get; set; }   // FK → Amenity
    public int      IDUnidadHabitacional { get; set; }   // FK → UnidadHabitacional
    public DateOnly FechaUso             { get; set; }
    public TimeOnly HoraInicio           { get; set; }
    public int      Posicion             { get; set; }   // orden FIFO
    public DateTime FechaInscripcion     { get; set; }   // UTC
    public string   Estado               { get; set; }   // "ESPERANDO" | "NOTIFICADO" | "EXPIRADO" | "CONFIRMADO"
    // --- ENMIENDA CU-05 (ampliado) ---
    public int       IDUsuario         { get; set; }      // FK → Usuario — quién se anotó, no solo la unidad
    public DateTime? FechaNotificacion { get; set; }       // UTC — cuándo pasó a NOTIFICADO
    public DateTime? FechaResolucion   { get; set; }       // UTC — cuándo pasó a CONFIRMADO o EXPIRADO
    public string?    MotivoExpiracion  { get; set; }       // "NO_RESPONDIO" | "CANCELO" | "YA_NO_CUMPLE_ANTICIPACION" | "AMENITY_DESHABILITADO" | null
    public Amenity            Amenity            { get; set; }
    public UnidadHabitacional UnidadHabitacional { get; set; }
    public Usuario             Usuario            { get; set; }
}
```
```csharp
modelBuilder.Entity<ListaEspera>(e => {
    e.ToTable("PB_ListaEspera");
    e.HasKey(x => x.IDListaEspera);
    e.Property(x => x.FechaUso).IsRequired().HasColumnType("date");
    e.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
    e.Property(x => x.Posicion).IsRequired();
    e.Property(x => x.FechaInscripcion).IsRequired().HasColumnType("timestamptz");
    e.Property(x => x.Estado).IsRequired().HasMaxLength(15).HasDefaultValue("ESPERANDO");
    e.Property(x => x.MotivoExpiracion).HasMaxLength(30);
    e.HasOne(x => x.Amenity).WithMany()
     .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
    e.HasOne(x => x.UnidadHabitacional).WithMany()
     .HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Restrict);
    e.HasOne(x => x.Usuario).WithMany()
     .HasForeignKey(x => x.IDUsuario).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-11 · MantenimientoProgramado · (CU-10)
```csharp
// Models/MantenimientoProgramado.cs
public class MantenimientoProgramado {
    public int      IDMantenimiento { get; set; }
    public int      IDAmenity       { get; set; }   // FK → Amenity
    public string   Descripcion     { get; set; }
    public string   Recurrencia     { get; set; }   // "LUNES".."DOMINGO" | "DIARIO" | "SEMANAL"
    public TimeOnly HoraInicio      { get; set; }
    public TimeOnly HoraFin         { get; set; }   // > HoraInicio
    public DateOnly FechaInicio     { get; set; }
    public DateOnly FechaFin        { get; set; }   // > FechaInicio
    public Amenity  Amenity         { get; set; }
}
```
```csharp
modelBuilder.Entity<MantenimientoProgramado>(e => {
    e.ToTable("PB_MantenimientoProgramado");
    e.HasKey(x => x.IDMantenimiento);
    e.Property(x => x.Descripcion).IsRequired().HasMaxLength(200);
    e.Property(x => x.Recurrencia).IsRequired().HasMaxLength(20);
    e.Property(x => x.HoraInicio).IsRequired().HasColumnType("time");
    e.Property(x => x.HoraFin).IsRequired().HasColumnType("time");
    e.Property(x => x.FechaInicio).IsRequired().HasColumnType("date");
    e.Property(x => x.FechaFin).IsRequired().HasColumnType("date");
    e.HasOne(x => x.Amenity).WithMany()
     .HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Restrict);
});
```

---

### ENT-12 · AuditLog · (CU-09 — RN-38)
```csharp
// Models/AuditLog.cs
public class AuditLog {
    public int      IDAuditLog  { get; set; }
    public string   Usuario     { get; set; }   // email o identificador del actor
    public string   Accion      { get; set; }   // "CREAR_RESERVA" | "CANCELAR_RESERVA" | "REGISTRAR_INCIDENCIA" | "SANCIONAR_UNIDAD" | "MODIFICAR_CONFIG"
    public string   Entidad     { get; set; }   // nombre de clase C#: "Reserva", "Incidencia", etc.
    public int      EntidadId   { get; set; }
    public DateTime FechaHora   { get; set; }   // UTC
    public string   Detalle     { get; set; }   // JSON serializado del payload de la acción
}
```
```csharp
modelBuilder.Entity<AuditLog>(e => {
    e.ToTable("PB_AuditLog");
    e.HasKey(x => x.IDAuditLog);
    e.Property(x => x.Usuario).IsRequired().HasMaxLength(100);
    e.Property(x => x.Accion).IsRequired().HasMaxLength(50);
    e.Property(x => x.Entidad).IsRequired().HasMaxLength(50);
    e.Property(x => x.EntidadId).IsRequired();
    e.Property(x => x.FechaHora).IsRequired().HasColumnType("timestamptz");
    e.Property(x => x.Detalle).HasColumnType("text");
});
```

---

---

## SPEC-CU08
### CU-08: Onboarding Consorcio / Complejo / Amenity

**Tipo:** Orquestador multi-entidad (NO hereda `ServiceAsync<T>`)
**Estado:** ✅ Implementado
**Migración:** `002_CU08_OnboardingDomain`
**Entidades:** ENT-01, ENT-02, ENT-03, ENT-04, ENT-05

#### Archivos

```
Models/               Consorcio.cs, Complejo.cs, UnidadHabitacional.cs, Amenity.cs, AmenityConfig.cs
DTOs/CU08/            ConsorcioDto.cs, ComplejoDto.cs, UnidadDto.cs
                      AmenityConfigDto.cs, AmenityCreacionDto.cs
                      OnboardingRequestDto.cs, OnboardingResponseDto.cs
Services/OnboardingService/   IOnboardingService.cs, OnboardingService.cs
Services/Ports/       IResidentNotificationPort.cs
Infrastructure/Adapters/      EmailNotificationAdapter.cs
Controllers/          OnboardingController.cs
```

#### DTOs

```csharp
// Input
public class ConsorcioDto     { public string Cuit, Nombre, Email, Telefono { get; set; } }
public class ComplejoDto      { public string Nombre, Tipo, Direccion { get; set; } }
public class UnidadDto        { public string Identificador, EmailResidente { get; set; } }
public class AmenityConfigDto {
    public string  HorarioInicio, HorarioFin { get; set; }        // "HH:mm"
    public int     DuracionBloqueMinutos, TiempoLimpiezaMinutos, LimiteReservasMesUnidad { get; set; }
    public decimal Tarifa { get; set; }
    public bool    RequiereAprobacion { get; set; }
}
public class AmenityCreacionDto { public string Nombre { get; set; } public int Capacidad { get; set; } public AmenityConfigDto Config { get; set; } }
public class OnboardingRequestDto {
    public ConsorcioDto Consorcio { get; set; }           // Required
    public ComplejoDto  Complejo  { get; set; }           // Required
    public List<UnidadDto>          Unidades  { get; set; }  // Required, min: 1
    public List<AmenityCreacionDto> Amenities { get; set; }  // Optional
}

// Output
public class OnboardingResponseDto {
    public int       IDConsorcio, IDComplejo { get; set; }
    public List<int> UnidadesIds, AmenitiesIds { get; set; }
    public string    Status { get; set; }   // "ONBOARDING_COMPLETE"
}
```

#### Business Rules — evaluación pre-persistencia

| BR-ID | P | Condición | Acción |
|---|---|---|---|
| `BR-ONB-001` | 1 | `Cuit` existe en `PB_Consorcio` | `BadRequestException("[BR-ONB-001] Ya existe un consorcio con el CUIT {cuit}.")` |
| `BR-ONB-003` | 1 | `Tipo` ∉ `{"EDIFICIO","BARRIO_PRIVADO"}` | `BadRequestException("[BR-ONB-003] Tipo de complejo inválido. Valores: EDIFICIO, BARRIO_PRIVADO.")` |
| `BR-RN34-001` | 2 | `HorarioFin <= HorarioInicio` | `BadRequestException("[BR-RN34-001] HorarioFin debe ser posterior a HorarioInicio.")` |
| `BR-RN34-002` | 2 | `DuracionBloqueMinutos<=0` OR `Capacidad<=0` OR `LimiteReservasMesUnidad<=0` | `BadRequestException("[BR-RN34-002] DuracionBloque, Capacidad y LimiteReservas deben ser enteros positivos.")` |
| `BR-RN34-003` | 2 | `Tarifa < 0` | `BadRequestException("[BR-RN34-003] La tarifa no puede ser negativa.")` |
| `BR-RN34-004` | 2 | `TiempoLimpiezaMinutos >= DuracionBloqueMinutos` | `BadRequestException("[BR-RN34-004] TiempoLimpieza debe ser menor que DuracionBloque.")` |
| `BR-ONB-002` | 3 | `Nombre` amenity existe en mismo `IDComplejo` | `BadRequestException("[BR-ONB-002] Ya existe un amenity '{nombre}' en este complejo.")` |
| `BR-DEFAULT` | — | `Estado == null` | silencioso → `"DISPONIBLE"` |

**Nota BR-ONB-002:** evaluar DENTRO de la transacción, luego de crear el Complejo (requiere IDComplejo).

#### Flujo de implementación — OnboardingService.ExecuteAsync

```
PASO 0  null-check request, Consorcio, Complejo, Unidades; Unidades.Count >= 1
PASO 1  Evaluar P1: BR-ONB-001, BR-ONB-003
        Evaluar P2: BR-RN34-001..004 por cada amenity del payload
PASO 2  BEGIN TRANSACTION (IDbContextTransaction)
  S1    Insert Consorcio
  S2    Insert Complejo (IDConsorcio = consorcio.IDConsorcio)
  S3    Task.WhenAll → Insert todas las Unidades (IDComplejo = complejo.IDComplejo)
  S4    foreach amenityDto:
          Evaluar BR-ONB-002 (ya tenemos IDComplejo)
          Insert Amenity
          Insert AmenityConfig (IDAmenity = amenity.IDAmenity)
  S5    COMMIT
PASO 3  EnqueueResidentInvitationsAsync (fuera de tx — Outbox)
        Si falla: log + reintento. NO rollback.
PASO 4  return ServiceResponse<OnboardingResponseDto> { Status = "ONBOARDING_COMPLETE" }
        catch → RollbackAsync → throw (middleware → HTTP 400/500)
```

#### Endpoint

```
POST /Onboarding
Body:    OnboardingRequestDto
200 OK:  ServiceResponse<OnboardingResponseDto>
400:     ServiceResponse<null> { errorMessage: "[BR-ID] ..." }
500:     ServiceResponse<null>
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IOnboardingService, OnboardingService>();
builder.Services.AddScoped<IResidentNotificationPort, EmailNotificationAdapter>();
```

#### Migración

```powershell
dotnet ef migrations add CU08_OnboardingDomain --output-dir Migrations
dotnet ef migrations script --output "scripts/002_CU08_OnboardingDomain.sql" --idempotent
dotnet ef database update
```

Tablas: `PB_Consorcio`, `PB_Complejo`, `PB_UnidadHabitacional`, `PB_Amenity`, `PB_AmenityConfig`

---

---

## SPEC-CU12
### CU-12: Consultar Disponibilidad de un Amenity

**Tipo:** Servicio de solo lectura — orquestador propio, **NO hereda `ServiceAsync<T>`** (no opera sobre una única entidad, agrega `Amenity` + `AmenityConfig` + `Reserva` + `MantenimientoProgramado`)
**Estado:** 🔲 Pendiente
**Depende de:** SPEC-ENT (ENT-04, ENT-05 con enmienda, ENT-08, ENT-11), SPEC-AUTH (roles), SPEC-CU01
**Migración:** ninguna nueva — solo lectura sobre tablas existentes (la enmienda de campos a ENT-05 ya está incluida en `002b`)
**Actor:** RESIDENTE (grupo `INQUILINO`/`PROPIETARIO`, consulta su propia unidad) / `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR` (consulta operativa multi-unidad)
**Excluido:** GUARDIA — no tiene necesidad funcional de este endpoint (BR-DISP-010)

#### Propósito

Responder, para un `Amenity` y un rango de fechas, qué bloques horarios están disponibles para reservar, en qué franja temporal puede operar el que consulta según su perfil, y bajo qué condiciones (cupo restante, aprobación requerida, tarifa). Es la consulta que el front hace *antes* de disparar `POST /Reserva` — evita que el residente descubra por prueba y error que un bloque está ocupado, fuera de horario o fuera de su ventana de anticipación.

#### Archivos

```
DTOs/CU12/                  DisponibilidadRequestDto.cs, DisponibilidadResponseDto.cs,
                             DisponibilidadDiaDto.cs, DisponibilidadSlotDto.cs
Services/DisponibilidadService/  IDisponibilidadService.cs, DisponibilidadService.cs
Controllers/                 AmenityController.cs (agregar método, no controller nuevo)
```

#### DTOs

```csharp
// Input — query params
public class DisponibilidadRequestDto {
    public int       IDAmenity            { get; set; }   // Required — route param
    public DateOnly  FechaDesde           { get; set; }   // Required
    public DateOnly? FechaHasta           { get; set; }   // Opcional; default = FechaDesde
    public int?      IDUnidadHabitacional { get; set; }   // Requerido si el grupo de rol es RESIDENTE (BR-DISP-011); ignorado/opcional si ADMIN
}

// Output
public class DisponibilidadResponseDto {
    public int      IDAmenity           { get; set; }
    public string   NombreAmenity       { get; set; }
    public string   EstadoAmenity       { get; set; }        // "DISPONIBLE" | "FUERA_DE_SERVICIO"
    public ConfigAplicadaDto Configuracion { get; set; }
    public DateOnly VentanaConsultableDesde { get; set; }
    public DateOnly VentanaConsultableHasta { get; set; }
    public int?     CupoRestanteUnidadMes { get; set; }
    public List<DisponibilidadDiaDto> Dias { get; set; }
}

public class ConfigAplicadaDto {
    public TimeOnly HorarioInicio         { get; set; }
    public TimeOnly HorarioFin            { get; set; }
    public int      DuracionBloqueMinutos { get; set; }
    public int      TiempoLimpiezaMinutos { get; set; }
    public int      MinAdvanceHours       { get; set; }
    public int      MaxAdvanceDays        { get; set; }
    public bool     RequiereAprobacion    { get; set; }
    public decimal  Tarifa                { get; set; }
    public int      LimiteReservasMesUnidad { get; set; }
}

public class DisponibilidadDiaDto {
    public DateOnly Fecha { get; set; }
    public List<DisponibilidadSlotDto> Slots { get; set; }
}

public class DisponibilidadSlotDto {
    public TimeOnly HoraInicio        { get; set; }
    public TimeOnly HoraFin           { get; set; }
    public bool     Disponible        { get; set; }
    public string?  MotivoNoDisponible { get; set; }
    // "OCUPADO" | "MANTENIMIENTO" | "FUERA_DE_SERVICIO" | "ANTICIPACION_MINIMA_NO_CUMPLIDA"
    // | "LIMITE_MENSUAL_ALCANZADO" | "RESERVADO_LISTA_ESPERA" | "FERIADO" | null (=> disponible)
}
```

#### Business Rules — evaluación en `DisponibilidadService.Consultar`, en este orden exacto

| BR-ID | P | Condición | Acción |
|---|---|---|---|
| `BR-DISP-001` | 1 | `Amenity` no existe | `NotFoundException("Amenity no encontrado.")` |
| `BR-DISP-002` | 1 | `Rol == "GUARDIA"` | Endpoint decorado `[Authorize(Roles="INQUILINO,PROPIETARIO,ADMINISTRADOR_LIVIANO,ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]` → `403` antes de llegar al servicio |
| `BR-DISP-003` | 1 | Rol del grupo RESIDENTE (`INQUILINO`/`PROPIETARIO`) y `IDUnidadHabitacional` no viene en el request | `BadRequestException("[BR-DISP-003] Debe indicar la unidad para consultar disponibilidad.")` |
| `BR-DISP-004` | 1 | Rol del grupo RESIDENTE y `IDUnidadHabitacional` enviado no tiene un `UsuarioUnidad` vigente para el `Usuario` autenticado | `BadRequestException("[BR-DISP-004] No puede consultar disponibilidad de una unidad que no le pertenece.")` |
| `BR-DISP-005` | 1 | `FechaHasta < FechaDesde` | `BadRequestException("[BR-DISP-005] El rango de fechas es inválido.")` |
| `BR-DISP-006` | 2 | Rol del grupo RESIDENTE y rango solicitado excede `hoy + AmenityConfig.MaxAdvanceDays` | No es error — clamp de `VentanaConsultableHasta`, informado en la respuesta |
| `BR-DISP-007` | 2 | Rol `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR` | Sin clamp de `MaxAdvanceDays` (tope operativo sugerido: 180 días, configurable) |
| `BR-DISP-008` | 3 | `Amenity.Estado == "FUERA_DE_SERVICIO"` | Todos los slots del rango: `Disponible = false`, `MotivoNoDisponible = "FUERA_DE_SERVICIO"` |
| `BR-DISP-009` | 4 | Por cada día del rango: generar grilla entre `HorarioInicio` y `HorarioFin`, paso `DuracionBloqueMinutos` | Base de la respuesta antes de exclusiones |
| `BR-DISP-010` | 4 | Slot solapa con `Reserva` cuyo `Estado IN ("CONFIRMADA","PENDIENTE_APROBACION","PENDIENTE_PAGO")`, considerando `HoraFin + TiempoLimpiezaMinutos` como fin real del bloqueo | `Disponible = false`, `MotivoNoDisponible = "OCUPADO"` |
| `BR-DISP-011` | 4 | Slot cae dentro de un `MantenimientoProgramado` activo | `Disponible = false`, `MotivoNoDisponible = "MANTENIMIENTO"` |
| `BR-DISP-012` | 4 | `Slot.HoraInicio` (convertida a `Tenant.TimeZoneId`, ver `BR-DISP-015`) `< Ahora + AmenityConfig.MinAdvanceHours` | `Disponible = false`, `MotivoNoDisponible = "ANTICIPACION_MINIMA_NO_CUMPLIDA"` |
| `BR-DISP-013` | 5 | Se envió `IDUnidadHabitacional` → calcular `CupoRestanteUnidadMes` por cada mes cubierto | Informativo, va en el response |
| `BR-DISP-014` | 5 | `CupoRestanteUnidadMes <= 0` para el mes correspondiente a un slot | `Disponible = false`, `MotivoNoDisponible = "LIMITE_MENSUAL_ALCANZADO"` — informativo, no bloquea la consulta |
| `BR-DISP-015` | 4 | Conversión de huso horario antes de cualquier comparación de horario | Usar `Tenant.TimeZoneId` (IANA), nunca comparar `UtcNow` directo contra horario local (ver enmienda de contingencia #8) |
| `BR-DISP-016` | 3 | Existe `DiaExcepcional` tipo `"FERIADO_CIERRA"` para la fecha | Todos los slots del día: `Disponible = false`, `MotivoNoDisponible = "FERIADO"` — precede a `IsOpen` fijo por día de semana |
| `BR-DISP-017` | 3 | Existe `DiaExcepcional` tipo `"APERTURA_EXTRAORDINARIA"` para un día que `IsOpen` marcaría cerrado | Se genera grilla igual para ese día puntual |
| `BR-DEFAULT` | — | Ninguna condición anterior aplicó al slot | `Disponible = true`, `MotivoNoDisponible = null` |

**Precedencia de motivos:** si un slot cae en más de una condición, se reporta la de menor P primero. `FUERA_DE_SERVICIO` y `FERIADO` (P3) siempre ganan sobre cualquier motivo de grilla (P4/P5).

**Solapamiento (mismo criterio que `BR-RES-007` de CU-01, con buffer sumado):**
`Slot.HoraInicio < (Reserva.HoraFin + TiempoLimpiezaMinutos) AND Slot.HoraFin > Reserva.HoraInicio`

#### Patrón de implementación

```csharp
public class DisponibilidadService : IDisponibilidadService {
    // 1. Cargar Amenity + AmenityConfig; null → NotFoundException (BR-DISP-001)
    // 2. Validar rol y pertenencia de unidad vía UsuarioUnidad (BR-DISP-003, BR-DISP-004)
    // 3. Validar/clampear rango de fechas (BR-DISP-005..007)
    // 4. Si FUERA_DE_SERVICIO → armar respuesta "todo bloqueado" y salir (BR-DISP-008)
    // 5. Traer en una sola query por tabla: Reservas activas, MantenimientoProgramado y
    //    DiaExcepcional del amenity en el rango (evitar N+1)
    // 6. Generar grilla por día y marcar cada slot contra las colecciones en memoria
    // 7. Si IDUnidadHabitacional viene: calcular CupoRestanteUnidadMes por mes
    // 8. return DisponibilidadResponseDto
}
```

> **Nota de performance:** el paso 5 es crítico — una query por tabla para todo el rango, no una por día.

#### Endpoints

```
GET /Amenity/{idAmenity}/Disponibilidad
    ?fechaDesde=2026-08-01&fechaHasta=2026-08-07&idUnidadHabitacional=12
    → ServiceResponse<DisponibilidadResponseDto>

[Authorize(Roles = "INQUILINO,PROPIETARIO,ADMINISTRADOR_LIVIANO,ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
```

#### Registro Program.cs
```csharp
builder.Services.AddScoped<IDisponibilidadService, DisponibilidadService>();
```

#### Relación con otros CU

| CU relacionado | Vínculo |
|---|---|
| CU-01 (Reservar) | El front llama a CU-12 antes de armar el `POST /Reserva`. CU-01 igual revalida todo (`BR-RES-003..008`) — CU-12 nunca es la fuente de verdad transaccional, solo UX. |
| CU-05 (Lista de Espera) | Si un slot da `MotivoNoDisponible = "OCUPADO"`, el front ofrece anotarse en lista de espera. Si hay un hold `NOTIFICADO` vigente, el motivo es `"RESERVADO_LISTA_ESPERA"`, distinto de `"OCUPADO"` a propósito. |
| CU-10 (Mantenimiento) | Fuente de `BR-DISP-011`. |

---

---

## SPEC-CU01
### CU-01: Reservar un Amenity

**Tipo:** Servicio específico (hereda `ServiceAsync<Reserva>`, override `Create`)
**Estado:** 🔲 Pendiente
**Migración:** `003_CU01_CU02_ReservaIncidencia` (compartida con CU-02)
**Entidades:** ENT-08 (Reserva)
**Actor:** `INQUILINO` (siempre puede) / `PROPIETARIO` (solo si `UsuarioUnidad.EsOcupanteActual = true` en esa unidad) / `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO` (reserva en nombre de un residente, uso operativo — ver SPEC-AUTH v2)
**Precondición:** sesión activa, unidad `EstadoUnidad = "ACTIVA"`, unidad `DebeExpensas = false`, amenity `Estado = "DISPONIBLE"`

#### Archivos

```
Models/               Reserva.cs
DTOs/CU01/            ReservaRequestDto.cs, ReservaResponseDto.cs
Services/ReservaService/    IReservaService.cs, ReservaService.cs
Controllers/          ReservaController.cs
```

#### DTOs

```csharp
// Input
public class ReservaRequestDto {
    public int      IDAmenity            { get; set; }   // Required
    public int      IDUnidadHabitacional { get; set; }   // Required
    public DateOnly FechaUso             { get; set; }   // Required
    public TimeOnly HoraInicio           { get; set; }   // Required
    public int      CantidadInvitados    { get; set; }   // default: 0
}

// Output
public class ReservaResponseDto {
    public int      IDReserva  { get; set; }
    public string   Estado     { get; set; }
    public DateOnly FechaUso   { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin    { get; set; }
    public string   NombreAmenity { get; set; }
    public string   IdentificadorUnidad { get; set; }
}
```

#### Business Rules — evaluación en ReservaService.Create, en este orden exacto

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-RES-001` | 1 | RN-01 | `UnidadHabitacional.DebeExpensas == true` | `BadRequestException("[BR-RES-001] La unidad tiene deuda de expensas pendiente.")` |
| `BR-RES-002` | 1 | RN-23 | `UnidadHabitacional.EstadoUnidad == "SUSPENDIDA"` | `BadRequestException("[BR-RES-002] La unidad se encuentra suspendida.")` |
| `BR-RES-003` | 1 | RN-08 | `HoraInicio < AmenityConfig.HorarioInicio` OR `HoraFin > AmenityConfig.HorarioFin` | `BadRequestException("[BR-RES-003] El bloque solicitado está fuera del horario operativo del amenity.")` |
| `BR-RES-004` | 1 | RN-10 | Fecha bloqueada por admin (tabla `PB_MantenimientoProgramado` o bloqueo especial) | `BadRequestException("[BR-RES-004] La fecha solicitada está bloqueada por la administración.")` |
| `BR-RES-005` | 1 | RN-06 | `FechaUso` fuera de `[Ahora + AmenityConfig.MinAdvanceHours, Ahora + AmenityConfig.MaxAdvanceDays]` (campos reales desde la enmienda de ENT-05, ya no genéricos) | `BadRequestException("[BR-RES-005] La reserva debe crearse con al menos {MinAdvanceHours} horas de anticipación y hasta {MaxAdvanceDays} días.")` |
| `BR-RES-006` | 1 | RN-27 | `CantidadInvitados > Amenity.Capacidad` | `BadRequestException("[BR-RES-006] La cantidad de invitados supera la capacidad del amenity ({cap}).")` |
| `BR-RES-007` | 2 | RN-09 | Existe `Reserva` activa en mismo `IDAmenity`, misma `FechaUso`, con solapamiento horario | `BadRequestException("[BR-RES-007] El bloque horario solicitado ya está ocupado.")` |
| `BR-RES-008` | 2 | RN-03 | `COUNT(Reserva activa futura de la unidad) >= límite configurable` | `BadRequestException("[BR-RES-008] La unidad alcanzó el límite de reservas activas.")` |
| `BR-RES-009` | 3 | RN-02 | Unidad reservó mismo amenity >= 2 veces en mes actual | estado → `"EN_ESPERA"` (no excepción; continuar flujo) |
| `BR-RES-010` | 4 | RN-35 | `AmenityConfig.RequiereAprobacion == true` | estado → `"PENDIENTE_APROBACION"` |
| `BR-RES-011` | 5 | RN-13 | `AmenityConfig.Tarifa > 0` y modalidad pago previo | estado → `"PENDIENTE_PAGO"` |
| `BR-ESP-008` | 4 | — | El slot tiene un hold `ListaEspera.Estado == "NOTIFICADO"` vigente (`VenceHoldEn > UtcNow`) de **otra** unidad (enmienda de CU-05) | `BadRequestException("[BR-ESP-008] Este turno está temporalmente reservado para otro residente de la lista de espera hasta las {VenceHoldEn}.")` — si el `IDUsuario` coincide con el titular del hold, se trata como confirmación normal |
| `BR-RES-012` | 6 | — | Job `NoShowDetectionJob` (Hangfire, cada 15 min): `Estado == "Confirmed"` AND `HoraFin + AmenityConfig.TiempoLimiteConfirmacionMinutos < UtcNow` AND `CheckInRealizado == false` (contingencia #1) | `Estado = "NoAsistio"` |
| `BR-RES-013` | 6 | — | Al pasar a `"NoAsistio"` | `UnidadHabitacional.ContadorNoShow += 1`; si `>= AmenityConfig.MaxNoShowPeriodo` (default 3) en 30 días → dispara `CU-06` automáticamente |
| `BR-RES-014` | 6 | — | `Reserva.Estado == "NoAsistio"` y `DepositAmount > 0` | El depósito **no** se devuelve automáticamente (`DepositReturned = false`) salvo devolución manual del admin |
| `BR-RES-015` | 5 | — | Al cancelar (`DELETE /Reserva/{id}`): calcular `HorasHastaTurno` y buscar `PoliticaCancelacionTramo` aplicable (específico del amenity, si no global del tenant) — contingencia #2 | `MontoRetenido = DepositAmount * PorcentajePenalidad / 100` |
| `BR-RES-016` | 5 | — | No existe tramo configurado (ni específico ni global) | Fallback: devolución 100% sin importar anticipación — no rompe consorcios sin política configurada |
| `BR-RES-017` | 5 | — | Tramo encontrado con `PorcentajePenalidad > 0` | `DepositReturned = (MontoRetenido == 0)`; se persiste `MontoRetenido` en la `Reserva` |
| `BR-RES-018` | 2 | — | `Tenant.RestringeReservasSimultaneas == true` y la unidad ya tiene otra `Reserva` activa (cualquier amenity) que solapa el horario solicitado (contingencia #4, opt-in por tenant) | `BadRequestException("[BR-RES-018] La unidad ya tiene una reserva activa en otro espacio para ese mismo horario.")` |
| `BR-RES-019` | Fase 4 | — | `SlotStrategy == "CapacityOpen"` y `AmenityConfig.FactorOverbooking != null` (contingencia #11, requiere datos históricos de `BR-RES-012/013`) | Aforo efectivo = `MaxCapacity * FactorOverbooking` en vez de `MaxCapacity` |
| `BR-DEFAULT` | — | — | Ninguna condición anterior | estado → `"CONFIRMADA"` |

**Cálculo de HoraFin:** `HoraFin = HoraInicio + DuracionBloqueMinutos`. Calcular en el servicio antes de persistir.
**Solapamiento (BR-RES-007):** `HoraInicio_nueva < HoraFin_existente AND HoraFin_nueva > HoraInicio_existente`

#### Patrón de implementación — ReservaService

```csharp
public class ReservaService : ServiceAsync<Reserva> {
    // Inyectar además: IRepositoryAsync<Amenity>, IRepositoryAsync<UnidadHabitacional>,
    //                  IRepositoryAsync<AmenityConfig>, IRepositoryAsync<MantenimientoProgramado>
    public override async Task<Reserva> Create(Reserva entity) {
        // 1. Cargar Amenity + AmenityConfig + UnidadHabitacional
        // 2. Evaluar BRs P1 en orden de tabla
        // 3. Evaluar BR-RES-007 (solapamiento)
        // 4. Evaluar BR-RES-008 (límite activas)
        // 5. Calcular HoraFin, FechaSolicitud = DateTime.UtcNow
        // 6. Determinar Estado según BR-RES-009..011 y BR-DEFAULT
        // 7. await _repository.Insert(entity)
        // 8. Encolar notificación (RN-30) si Estado == "CONFIRMADA"
        // 9. return entity
    }
    protected override Expression<Func<Reserva, bool>> BuildCriterio(QueryParams qp) {
        // filtrar por IDAmenity y/o IDUnidadHabitacional si vienen en qp
    }
}
```

#### Endpoints (hereda GenericControllerAsync<Reserva> — override POST)

```
POST   /Reserva                   → Create con ReservaRequestDto
GET    /Reserva/GetById?id={id}   → GetById
GET    /Reserva/FindQP            → búsqueda paginada
PUT    /Reserva                   → Update (solo admin; estado CONFIRMADA → no modificable — RN-11)
DELETE /Reserva/{id}              → cancelar (validar margen — RN-05)
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IServiceAsync<Reserva>, ReservaService>();
```

#### Migración

```powershell
dotnet ef migrations add CU01_CU02_ReservaIncidencia --output-dir Migrations
dotnet ef migrations script --output "scripts/003_CU01_CU02_ReservaIncidencia.sql" --idempotent
dotnet ef database update
```

---

---

## SPEC-CU02
### CU-02: Reportar Incidencia en Amenity

**Tipo:** Servicio específico (hereda `ServiceAsync<Incidencia>`, override `Create`)
**Estado:** 🔲 Pendiente
**Migración:** `003_CU01_CU02_ReservaIncidencia` (compartida con CU-01)
**Entidades:** ENT-09 (Incidencia)
**Actor:** `INQUILINO`/`PROPIETARIO` / `GUARDIA` (BR-AUTH-007, gap resuelto — el guardia reporta lo que detecta en su recorrida) / `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO`

#### Archivos

```
Models/               Incidencia.cs
DTOs/CU02/            IncidenciaRequestDto.cs, IncidenciaResponseDto.cs
Services/IncidenciaService/   IIncidenciaService.cs, IncidenciaService.cs
Controllers/          IncidenciaController.cs
```

#### DTOs

```csharp
// Input
public class IncidenciaRequestDto {
    public int    IDAmenity            { get; set; }   // Required
    public int    IDUnidadHabitacional { get; set; }   // Required
    public string Descripcion          { get; set; }   // Required
}

// Output
public class IncidenciaResponseDto {
    public int      IDIncidencia  { get; set; }
    public string   Estado        { get; set; }
    public string   NombreAmenity { get; set; }
    public DateTime FechaReporte  { get; set; }
    public string   Descripcion   { get; set; }
}
```

#### Business Rules — evaluación en IncidenciaService.Create, en este orden

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-INC-001` | 1 | RN-17 | Siempre al crear | `Amenity.Estado = "FUERA_DE_SERVICIO"` (update automático en la misma tx) |
| `BR-INC-002` | 2 | RN-18 | Tras BR-INC-001 | Cancelar en cascada todas las `Reserva` futuras del amenity (`Estado = "CANCELADA"`) |
| `BR-INC-003` | 3 | RN-15 | Por cada Reserva cancelada en cascada con `Tarifa > 0` | Acreditar monto a `UnidadHabitacional.SaldoActual` (o emitir crédito) |

#### Patrón de implementación — IncidenciaService

```csharp
public class IncidenciaService : ServiceAsync<Incidencia> {
    // Inyectar además: IRepositoryAsync<Amenity>, IRepositoryAsync<Reserva>,
    //                  IRepositoryAsync<AmenityConfig>, INotificationPort
    public override async Task<Incidencia> Create(Incidencia entity) {
        // Usar IDbContextTransaction (tx explícita — múltiples entidades afectadas)
        // 1. Cargar Amenity; validar que existe
        // 2. entity.Estado = "ABIERTA"; entity.FechaReporte = DateTime.UtcNow
        // 3. BEGIN TRANSACTION
        //    a) Insert Incidencia
        //    b) Amenity.Estado = "FUERA_DE_SERVICIO"; Update Amenity (BR-INC-001)
        //    c) Buscar Reservas futuras activas del amenity; foreach → Estado = "CANCELADA" (BR-INC-002)
        //    d) Por cada reserva cancelada con tarifa > 0: acreditar (BR-INC-003)
        //    e) COMMIT
        // 4. Notificar admin + unidades afectadas (RN-31) — fuera de tx
        // 5. return entity
    }
}
```

#### Endpoint

```
POST /Incidencia       → Create
GET  /Incidencia/GetById?id={id}
GET  /Incidencia/FindQP
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IServiceAsync<Incidencia>, IncidenciaService>();
```

---

---

## SPEC-CU04
### CU-04: Resolver Incidencia y Rehabilitar Amenity

**Tipo:** Operación de actualización con efecto en cascada (método adicional en IncidenciaService)
**Estado:** 🔲 Pendiente
**Depende de:** SPEC-CU02 (misma entidad y servicio)
**Actor:** `ADMINISTRADOR_AVANZADO` (resolución formal con costo/historial) — `ADMINISTRADOR_LIVIANO` puede *bloquear* un amenity por incidencia puntual pero no cerrar el ciclo completo (frontera a confirmar con negocio, ver SPEC-AUTH v2 nota CU-04)

#### DTO

```csharp
// DTOs/CU04/ResolucionDto.cs
public class ResolucionDto {
    public int     IDIncidencia    { get; set; }   // Required
    public string  DetalleTrabajos { get; set; }   // Required
    public decimal CostoEstimado   { get; set; }   // Required, min: 0
}
```

#### Business Rules — evaluación en IncidenciaService.Resolver

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-INC-004` | 1 | — | `Incidencia.Estado == "RESUELTA"` | `BadRequestException("[BR-INC-004] La incidencia ya fue resuelta.")` |
| `BR-INC-005` | 2 | RN-19 | Al cambiar a "RESUELTA" | `Amenity.Estado = "DISPONIBLE"` (automático, misma tx) |
| `BR-INC-006` | 3 | RN-21 | Siempre | Completar `Incidencia.DetalleResolucion`, `CostoEstimado`, `FechaResolucion = DateTime.UtcNow` |

#### Patrón de implementación

```csharp
// Agregar en IncidenciaService:
public async Task<ServiceResponse<IncidenciaResponseDto>> Resolver(ResolucionDto dto) {
    // BEGIN TRANSACTION
    // 1. Cargar Incidencia; evaluar BR-INC-004
    // 2. Incidencia.Estado = "RESUELTA"; DetalleResolucion, CostoEstimado, FechaResolucion — BR-INC-006
    // 3. Cargar Amenity; Amenity.Estado = "DISPONIBLE" — BR-INC-005
    // 4. Update Incidencia + Update Amenity
    // 5. COMMIT
    // return ServiceResponse<IncidenciaResponseDto>
}
```

#### Endpoint (agregar en IncidenciaController)

```
PUT /Incidencia/Resolver
Body:  ResolucionDto
200:   ServiceResponse<IncidenciaResponseDto>
400:   ServiceResponse<null>
```

---

---

## SPEC-CU03
### CU-03: Control de Acceso de Invitados

**Tipo:** Servicio específico (hereda `ServiceAsync<Invitado>`, endpoints adicionales propios)
**Estado:** 🔲 Pendiente
**Migración:** `004_CU03_InvitadoInquilino`
**Entidades:** ENT-07 (Invitado), ENT-06 (Inquilino)
**Actor:** `GUARDIA` si `Tenant.TieneGuardiaDedicado = true` (BR-AUTH-015) / `ADMINISTRADOR_LIVIANO` si `Tenant.TieneGuardiaDedicado = false` (BR-AUTH-014) — son roles mutuamente excluyentes por tenant, no ambos a la vez

#### Archivos

```
Models/               Invitado.cs, Inquilino.cs
DTOs/CU03/            AccesoConsultaDto.cs, AccesoResultadoDto.cs, EgresoDto.cs
Services/AccesoService/   IAccesoService.cs, AccesoService.cs
Controllers/          InvitadoController.cs   (hereda GenericControllerAsync<Invitado>)
                      AccesoController.cs      (controller propio para consulta/registro)
```

#### DTOs

```csharp
// Input consulta
public class AccesoConsultaDto { public string Dni { get; set; } }

// Output consulta
public class AccesoResultadoDto {
    public bool   Autorizado      { get; set; }
    public string Motivo          { get; set; }   // null si Autorizado
    public string UnidadAnfitriona { get; set; }  // null si denegado
    public int?   IDInvitado      { get; set; }
}

// Input egreso
public class EgresoDto { public int IDInvitado { get; set; } }
```

#### Business Rules — evaluación en AccesoService.Consultar

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-ACC-001` | 1 | — | `Invitado` con ese DNI no existe | `Autorizado = false; Motivo = "Invitado no registrado en ninguna unidad del consorcio."` |
| `BR-ACC-002` | 2 | RN-28 | `Invitado.EstadoAcceso == "DENEGADO"` | `Autorizado = false; Motivo = "Acceso denegado por historial negativo."` |
| `BR-DEFAULT` | — | — | Pasa todas las validaciones | `Autorizado = true; UnidadAnfitriona = identificador de la unidad` |

#### Patrón de implementación — AccesoService

```csharp
public interface IAccesoService {
    Task<AccesoResultadoDto> Consultar(string dni);
    Task RegistrarIngreso(int idInvitado);
    Task RegistrarEgreso(int idInvitado);     // RN-29
}

// Consultar:
//   1. Find Invitado por DNI
//   2. Evaluar BR-ACC-001
//   3. Evaluar BR-ACC-002
//   4. Registrar HoraIngreso = DateTime.UtcNow; Update Invitado
//   5. return AccesoResultadoDto

// RegistrarEgreso:
//   1. GetByID Invitado; si null → NotFoundException
//   2. Invitado.HoraEgreso = DateTime.UtcNow; Update
```

#### Endpoints

```
POST /Acceso/Consultar        Body: AccesoConsultaDto   → ServiceResponse<AccesoResultadoDto>
POST /Acceso/RegistrarIngreso Body: { IDInvitado: int } → ServiceResponse<object>
POST /Acceso/RegistrarEgreso  Body: EgresoDto           → ServiceResponse<object>    (RN-29)
GET  /Invitado/GetById?id={id}
GET  /Invitado/FindQP
POST /Invitado                → Create invitado (gestión desde unidad)
PUT  /Invitado                → Update (cambiar EstadoAcceso)
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IAccesoService, AccesoService>();
builder.Services.AddScoped<IServiceAsync<Invitado>, ServiceAsync<Invitado>>();
builder.Services.AddScoped<IServiceAsync<Inquilino>, ServiceAsync<Inquilino>>();
```

#### Migración

```powershell
dotnet ef migrations add CU03_InvitadoInquilino --output-dir Migrations
dotnet ef migrations script --output "scripts/004_CU03_InvitadoInquilino.sql" --idempotent
```

Tablas: `PB_Invitado`, `PB_Inquilino`

---

---

## SPEC-CU05
### CU-05: Lista de Espera de un Amenity

**Tipo:** Servicio específico (hereda `ServiceAsync<ListaEspera>`, override `Create`) + Job en background (Hangfire) para expiración
**Estado:** 🔲 Pendiente
**Depende de:** ENT-10 (con enmienda), ENT-05 (con enmienda), SPEC-CU01, SPEC-CU12
**Migración:** `005_CU05_ListaEspera` + reutiliza `002b`
**Actor:** grupo RESIDENTE (`INQUILINO`/`PROPIETARIO`, se anota / consulta posición / se retira) — `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR` (consulta operativa, puede forzar notificación manual)
**Excluido:** GUARDIA (BR-DISP-002, mismo criterio que CU-12)

#### Propósito

Cuando `SPEC-CU12` devuelve un slot con `MotivoNoDisponible = "OCUPADO"`, el residente puede anotarse en una fila FIFO (con criterio de fair-use) para ese `IDAmenity` + `FechaUso` + `HoraInicio`. Si la reserva que ocupaba ese slot se cancela, el primero de la fila recibe un **hold temporal** (no una confirmación automática) y tiene una ventana de tiempo para confirmar; si no responde, pasa al siguiente.

#### DTOs

```csharp
public class ListaEsperaRequestDto {
    public int      IDAmenity            { get; set; }
    public int      IDUnidadHabitacional { get; set; }
    public DateOnly FechaUso             { get; set; }
    public TimeOnly HoraInicio           { get; set; }
}

public class ConfirmarListaEsperaDto {
    public int IDListaEspera { get; set; }
}

public class ListaEsperaResponseDto {
    public int       IDListaEspera { get; set; }
    public int       Posicion      { get; set; }
    public string    Estado        { get; set; }
    public string    NombreAmenity { get; set; }
    public DateOnly  FechaUso      { get; set; }
    public TimeOnly  HoraInicio    { get; set; }
    public DateTime? VenceHoldEn   { get; set; }
}
```

#### Business Rules — evaluación en `ListaEsperaService.Create`, en este orden exacto

| BR-ID | P | Condición | Acción |
|---|---|---|---|
| `BR-ESP-001` | 1 | El slot solicitado **no** tiene `Reserva` activa que lo ocupe (mismo criterio de `BR-DISP-010`) | `BadRequestException("[BR-ESP-001] El bloque solicitado está disponible; use el flujo de reserva normal (CU-01).")` |
| `BR-ESP-002` | 1 | Slot fuera del horario operativo, o no cumple `MinAdvanceHours`/`MaxAdvanceDays` | `BadRequestException("[BR-ESP-002] No se puede anotar en lista de espera para un horario fuera de la ventana operativa del amenity.")` |
| `BR-ESP-003` | 1 | `AmenityConfig.PermiteListaEsperaMismoDia == false` y `FechaUso == hoy` | `BadRequestException("[BR-ESP-003] Este amenity no admite lista de espera para el mismo día.")` |
| `BR-ESP-004` | 1 | `UnidadHabitacional.EstadoUnidad == "SUSPENDIDA"` o `DebeExpensas == true` | `BadRequestException("[BR-ESP-004] La unidad no puede anotarse en lista de espera (deuda o suspensión).")` |
| `BR-ESP-005` | 2 | Ya existe registro activo (`Estado IN ("ESPERANDO","NOTIFICADO")`) de la misma unidad para el mismo slot | `BadRequestException("[BR-ESP-005] La unidad ya está anotada en la lista de espera para este turno.")` |
| `BR-ESP-006` | 2 | `COUNT(ListaEspera activa de la unidad) >= AmenityConfig.MaxPosicionesListaEsperaPorUnidad` | `BadRequestException("[BR-ESP-006] La unidad alcanzó el máximo de anotaciones simultáneas en listas de espera.")` |
| `BR-ESP-007` | 3 | Unidad ya reservó el amenity >= 2 veces en el mes | Se anota igual, pero `Posicion` se calcula con fair-use (menor uso primero, luego `FechaInscripcion` ASC) |
| `BR-ESP-009` | 2 | `ListaEspera` pasa a `EXPIRADO` con `MotivoExpiracion = "NO_RESPONDIO"` | `UnidadHabitacional.ContadorNoRespondioListaEspera += 1` |
| `BR-ESP-010` | 1 | `ContadorNoRespondioListaEspera >= 3` en 30 días | `BloqueadaListaEsperaHasta = UtcNow + 15 días` (configurable) — no afecta reservar directo, solo anotarse en nuevas listas |
| `BR-ESP-011` | 1 | `POST /ListaEspera` con `UnidadHabitacional.BloqueadaListaEsperaHasta > UtcNow` (se evalúa **antes** que `BR-ESP-001`) | `BadRequestException("[BR-ESP-011] La unidad tiene restringida la anotación a listas de espera hasta {fecha} por inasistencias reiteradas.")` |
| `BR-ESP-012` | — | Reseteo de `ContadorNoRespondioListaEspera` | Job mensual, o al confirmar exitosamente, resetea a 0 tras 90 días sin nueva ocurrencia |
| `BR-DEFAULT` | — | Ninguna condición anterior aplicó | `Posicion` según BR-ESP-007; `Estado = "ESPERANDO"`; `FechaInscripcion = UtcNow` |

**Nota de diseño — `Posicion` es derivada, no fija:** se recalcula en cada lectura a partir de `FechaInscripcion` + ajuste de fair-use, vía `ROW_NUMBER() OVER (PARTITION BY IDAmenity, FechaUso, HoraInicio ORDER BY EsUsoBajo DESC, FechaInscripcion ASC)` — evita re-numerar toda la fila en cada baja.

#### Flujo de liberación (trigger: `Reserva` pasa a `"CANCELADA"` o `"RECHAZADA"`)

```
1. Buscar ListaEspera activa (Estado = "ESPERANDO") para el mismo slot, ORDER BY Posicion ASC LIMIT 1
2. Si no hay nadie esperando → fin
3. Si hay alguien:
   a. Estado = "NOTIFICADO"; FechaNotificacion = UtcNow
   b. RT-ESP-001: tomar el mismo lock de Redis que usa CU-01 (booking-lock:{amenityId}:{date}:{slotStart}),
      TTL = AmenityConfig.TiempoLimiteConfirmacionMinutos — el titular del hold es dueño temporal del slot
      a nivel de Redis, no solo a nivel de validación de aplicación
   c. Notificar (RN-32) — push + fallback multicanal si no hay ack en 5 min (ver BR-NOT-005/006, SPEC-NOTIF)
   d. VenceHoldEn = FechaNotificacion + AmenityConfig.TiempoLimiteConfirmacionMinutos
   e. CU-12 muestra ese slot con MotivoNoDisponible = "RESERVADO_LISTA_ESPERA" (no "OCUPADO")
4. Confirmación (ConfirmarListaEsperaDto):
   - Si vigente y el IDUsuario coincide con el titular → dispara el Create de CU-01 con los datos del hold;
     Estado = "CONFIRMADO"; FechaResolucion = UtcNow; RT-ESP-002: liberar el lock de Redis
   - Si vencido → job de expiración
5. Job Hangfire (cada 1 minuto):
   - ListaEspera con Estado = "NOTIFICADO" y VenceHoldEn < UtcNow → Estado = "EXPIRADO";
     MotivoExpiracion = "NO_RESPONDIO"; FechaResolucion = UtcNow; dispara BR-ESP-009; vuelve a paso 1
```

**Regla nueva en `SPEC-CU01`:** `BR-ESP-008` — si el slot tiene un hold `NOTIFICADO` vigente de otra unidad, `BadRequestException("[BR-ESP-008] Este turno está temporalmente reservado para otro residente de la lista de espera hasta las {VenceHoldEn}.")`. `RT-ESP-003`: a nivel Redis, cualquier intento de `CU-01` sobre ese slot ya falla por el lock tomado en el paso 3.b — `BR-ESP-008` es la segunda capa de defensa, no la única.

#### Retiro voluntario

```
DELETE /ListaEspera/{id}
- Solo el titular o ADMIN puede retirarse
- Si Estado == "NOTIFICADO" → dispara el paso 5 inmediatamente (no espera el TTL completo)
- Estado = "EXPIRADO"; MotivoExpiracion = "CANCELO"
```

#### Endpoints

```
POST   /ListaEspera
GET    /ListaEspera/{id}
GET    /ListaEspera/MisAnotaciones
GET    /Amenity/{id}/ListaEspera            (vista operativa admin)
POST   /ListaEspera/{id}/Confirmar
DELETE /ListaEspera/{id}

[Authorize(Roles = "INQUILINO,PROPIETARIO,ADMINISTRADOR_LIVIANO,ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IServiceAsync<ListaEspera>, ListaEsperaService>();
RecurringJob.AddOrUpdate<ListaEsperaExpiracionJob>(
    "lista-espera-expiracion", job => job.Ejecutar(), "* * * * *");
```

#### Migración

```powershell
dotnet ef migrations add CU05_ListaEspera --output-dir Migrations
dotnet ef migrations script --output "scripts/005_CU05_ListaEspera.sql" --idempotent
```

#### Relación con otros CU

| CU relacionado | Vínculo |
|---|---|
| CU-12 (Disponibilidad) | Fuente del gatillo "OCUPADO → ofrecer lista de espera". |
| CU-01 (Reservar) | `BR-ESP-008` evita que un tercero "robe" el slot durante el hold. |
| CU-06 (Sancionar Unidad) | Un patrón de `NO_RESPONDIO` repetido (`BR-ESP-010`) puede alimentar `ContadorInfracciones`. |

> **Caso de prueba a agregar a la suite:** `Confirmar_YLuegoCancelar_ReofreceAlSiguienteDeLaFila` — el flujo de liberación ya se dispara desde cualquier `Reserva` cancelada, sin importar si se originó por `CU-01` directo o por confirmación de un hold; no requiere código nuevo, solo test explícito.

---

---

## SPEC-CU06
### CU-06: Sancionar Unidad Habitacional

**Tipo:** Método adicional en servicio de UnidadHabitacional
**Estado:** 🔲 Pendiente
**Depende de:** ENT-03 (campo `EstadoUnidad`, `ContadorInfracciones` ya definidos en SPEC-ENT)
**Actor:** `ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR` (BR-AUTH-016 — `ADMINISTRADOR_LIVIANO` no sanciona) — también se dispara automáticamente desde `BR-RES-013` (no-show) y `BR-ESP-010` (abuso de lista de espera)

#### DTOs

```csharp
// Input
public class SancionRequestDto {
    public int    IDUnidadHabitacional { get; set; }   // Required
    public string Descripcion          { get; set; }   // Required
    public bool   AplicarSuspension    { get; set; }   // true = suspender unidad
    public int    DuracionDias         { get; set; }   // 0 = indefinido
}

// Output
public class SancionResponseDto {
    public int    IDUnidadHabitacional { get; set; }
    public string EstadoUnidad         { get; set; }
    public int    ContadorInfracciones { get; set; }
    public string Mensaje              { get; set; }
}
```

#### Business Rules

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-SAN-001` | 1 | RN-26 | Siempre | `ContadorInfracciones++`; si >= umbral configurable → notificar admin |
| `BR-SAN-002` | 2 | RN-23 | `AplicarSuspension == true` | `EstadoUnidad = "SUSPENDIDA"`; cancelar reservas futuras activas de la unidad |
| `BR-SAN-003` | 3 | RN-31 | `AplicarSuspension == true` | Notificar a residentes de la unidad con motivo y duración |

#### Patrón de implementación

```csharp
// Agregar en UnidadHabitacionalService (o servicio orquestador propio):
public async Task<SancionResponseDto> Sancionar(SancionRequestDto dto) {
    // BEGIN TRANSACTION
    // 1. Cargar UnidadHabitacional; null → NotFoundException
    // 2. ContadorInfracciones++ (BR-SAN-001)
    //    Si ContadorInfracciones >= umbral → loguear alerta para admin
    // 3. Si AplicarSuspension:
    //    EstadoUnidad = "SUSPENDIDA"
    //    Buscar Reservas activas futuras de la unidad → Estado = "CANCELADA" (BR-SAN-002)
    // 4. Update UnidadHabitacional
    // 5. COMMIT
    // 6. Notificar residentes (BR-SAN-003) — fuera de tx
}
```

#### Endpoint

```
POST /UnidadHabitacional/Sancionar
Body: SancionRequestDto → ServiceResponse<SancionResponseDto>
```

---

---

## SPEC-CU07
### CU-07: Pago de Reserva

**Tipo:** Servicio orquestador propio (NO hereda `ServiceAsync<T>`)
**Estado:** 🔲 Pendiente
**Depende de:** SPEC-CU01
**Actor:** `INQUILINO` / `PROPIETARIO` (si `EsOcupanteActual`)

#### Archivos

```
Services/Ports/     IPaymentGatewayPort.cs
Infrastructure/Adapters/    PaymentGatewayAdapter.cs
Services/PagoService/       IPagoService.cs, PagoService.cs
Controllers/        PagoController.cs
```

#### DTOs

```csharp
// Input
public class PagoRequestDto {
    public int    IDReserva      { get; set; }   // Required
    public string MetodoPago     { get; set; }   // "TARJETA" | "TRANSFERENCIA" | "BILLETERA_DIGITAL"
    public string TokenPasarela  { get; set; }   // token generado por el frontend desde el SDK de la pasarela
}

// Output
public class PagoResponseDto {
    public int      IDReserva     { get; set; }
    public string   EstadoReserva { get; set; }   // "CONFIRMADA" o "CANCELADA"
    public bool     PagoExitoso   { get; set; }
    public string   Comprobante   { get; set; }   // URL o número de comprobante (RN-16)
}
```

#### Business Rules

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-PAG-001` | 1 | — | `Reserva.Estado != "PENDIENTE_PAGO"` | `BadRequestException("[BR-PAG-001] La reserva no está en estado de pago pendiente.")` |
| `BR-PAG-002` | 2 | RN-13 | Pago exitoso en pasarela | `Reserva.Estado = "CONFIRMADA"`; emitir comprobante (RN-16) |
| `BR-PAG-003` | 2 | RN-13 | Pago fallido | `Reserva.Estado = "CANCELADA"`; liberar bloque |
| `BR-PAG-004` | 3 | RN-14 | Amenity de tipo evento (SUM/Parrilla) | Adicionar depósito de garantía al monto |
| `BR-PAG-005` | — | RN-16 | Cualquier transacción exitosa | Emitir comprobante digital (PDF/email) |

#### Port interface

```csharp
public interface IPaymentGatewayPort {
    Task<(bool Exitoso, string Referencia)> ProcesarPagoAsync(string token, decimal monto, string metodo);
}
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IPaymentGatewayPort, PaymentGatewayAdapter>();
```

#### Endpoint

```
POST /Pago
Body: PagoRequestDto → ServiceResponse<PagoResponseDto>
```

---

---

## SPEC-CU09
### CU-09: Reportes y Auditoría

**Tipo:** Servicio de solo lectura + AuditLog cross-cutting
**Estado:** 🔲 Pendiente
**Migración:** `006_CU09_AuditLog` + `006b` (tabla `PB_EventoAuditoria`, contingencia #10)
**Entidades:** ENT-12 (AuditLog) + `EventoAuditoria` (nueva, ver enmienda abajo)
**Actor:** `ADMINISTRADOR_AVANZADO` (solo su propio tenant) / `SUPER_ADMINISTRADOR` (cross-tenant, requiere `BR-AUTH-005` — bypass del query filter global) — `ADMINISTRADOR_LIVIANO` tiene una vista básica, no el reporte formal completo

#### Archivos

```
Models/               AuditLog.cs
DTOs/CU09/            ReporteRequestDto.cs, ReporteResponseDto.cs, AuditLogDto.cs
Services/ReporteService/    IReporteService.cs, ReporteService.cs
Services/              IAuditService.cs, AuditService.cs   ← cross-cutting; inyectado en servicios que emiten acciones críticas
Controllers/          ReporteController.cs
```

#### DTOs

```csharp
// Input filtros
public class ReporteRequestDto {
    public string   TipoReporte { get; set; }   // "USO_AMENITIES" | "MOROSIDAD" | "INCIDENCIAS" | "INGRESOS"
    public DateOnly FechaDesde  { get; set; }
    public DateOnly FechaHasta  { get; set; }
    public int?     IDAmenity   { get; set; }   // nullable → todos
    public int?     IDComplejo  { get; set; }   // nullable → todos
}

// Output genérico (el agente adaptará Data según TipoReporte)
public class ReporteResponseDto {
    public string       TipoReporte { get; set; }
    public DateOnly     FechaDesde  { get; set; }
    public DateOnly     FechaHasta  { get; set; }
    public List<object> Data        { get; set; }
    public int          TotalRegistros { get; set; }
}
```

#### Business Rules

| BR-ID | RN | Regla |
|---|---|---|
| `BR-AUD-001` | RN-38 | `AuditService.Registrar(usuario, accion, entidad, id, detailJson)` debe invocarse desde: `ReservaService.Create`, `ReservaService.Delete`, `IncidenciaService.Create`, `IncidenciaService.Resolver`, `SancionarUnidad`, toda modificación de `AmenityConfig`. |
| `BR-AUD-002` | RN-40 | Reporte MOROSIDAD: consulta directa sin caché. Retornar unidades con `DebeExpensas = true` que tengan `Reserva` activa futura. |
| `BR-AUD-003` | — | Contingencia #10: cualquier transición de `Estado` en `Reserva` o `ListaEspera` (creación incluida, `EstadoAnterior = null`) | Insertar `EventoAuditoria` en la misma transacción — vía interceptor de `SaveChangesAsync`, no repetido en cada servicio |
| `BR-AUD-004` | — | Admin consulta `GET /Auditoria/{entidad}/{id}` | Devuelve la línea de tiempo completa ordenada por `Timestamp` — respuesta directa a reclamos tipo "yo estaba primero en la lista" (ver `SPEC-CU05`) |

**Entidad nueva — `EventoAuditoria` (genérica, complementa a `AuditLog`, no la reemplaza — `AuditLog` es para acciones administrativas discretas vía `BR-AUD-001`, `EventoAuditoria` es específicamente para trazar transiciones de estado de `Reserva`/`ListaEspera` con más detalle):**
```csharp
public class EventoAuditoria {
    public long      IDEvento       { get; set; }
    public Guid      TenantId       { get; set; }
    public string    Entidad        { get; set; }   // "Reserva" | "ListaEspera" | "Amenity"...
    public int       IDEntidad      { get; set; }
    public string?   EstadoAnterior { get; set; }
    public string    EstadoNuevo    { get; set; }
    public int?      IDUsuario      { get; set; }    // null si lo disparó un job automático
    public string?   Origen         { get; set; }    // "USUARIO" | "JOB" | "SISTEMA"
    public string?   Detalle        { get; set; }
    public DateTime  Timestamp      { get; set; }    // UTC
}
```
```csharp
modelBuilder.Entity<EventoAuditoria>(e => {
    e.ToTable("PB_EventoAuditoria");
    e.HasKey(x => x.IDEvento);
    e.HasIndex(x => new { x.Entidad, x.IDEntidad });
    e.HasIndex(x => x.Timestamp);
    // Sin FK dura — polimórfico por diseño, se resuelve por (Entidad, IDEntidad)
});
```

#### IAuditService interface

```csharp
public interface IAuditService {
    Task Registrar(string usuario, string accion, string entidad, int entidadId, object detalle);
}
// AuditService implementa: serializa detalle a JSON, Insert AuditLog vía IRepositoryAsync<AuditLog>
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IReporteService, ReporteService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IServiceAsync<AuditLog>, ServiceAsync<AuditLog>>();
```

#### Migración

```powershell
dotnet ef migrations add CU09_AuditLog --output-dir Migrations
dotnet ef migrations script --output "scripts/006_CU09_AuditLog.sql" --idempotent
dotnet ef migrations add CU09_EventoAuditoria --output-dir Migrations
dotnet ef migrations script --output "scripts/006b_EventoAuditoria.sql" --idempotent
```
Endpoint nuevo: `GET /Auditoria/{entidad}/{id}` → línea de tiempo completa (`BR-AUD-004`).

---

---

## SPEC-CU10
### CU-10: Mantenimiento Programado Preventivo

**Tipo:** Servicio específico (hereda `ServiceAsync<MantenimientoProgramado>`, override `Create`)
**Estado:** 🔲 Pendiente
**Migración:** `007_CU10_MantenimientoProgramado`
**Entidades:** ENT-11 (MantenimientoProgramado) + `DiaExcepcional` (nueva, contingencia #8)
**Actor:** `ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR`

#### DTOs

```csharp
// Input
public class MantenimientoRequestDto {
    public int      IDAmenity   { get; set; }    // Required
    public string   Descripcion { get; set; }    // Required
    public string   Recurrencia { get; set; }    // Required: "LUNES".."DOMINGO" | "DIARIO" | "SEMANAL"
    public string   HoraInicio  { get; set; }    // Required "HH:mm"
    public string   HoraFin     { get; set; }    // Required "HH:mm" > HoraInicio
    public DateOnly FechaInicio { get; set; }    // Required
    public DateOnly FechaFin    { get; set; }    // Required > FechaInicio
}

// Output
public class MantenimientoResponseDto {
    public int      IDMantenimiento { get; set; }
    public string   NombreAmenity   { get; set; }
    public string   Recurrencia     { get; set; }
    public string   HoraInicio      { get; set; }
    public string   HoraFin         { get; set; }
    public DateOnly FechaInicio     { get; set; }
    public DateOnly FechaFin        { get; set; }
    public int      ReservasCanceladas { get; set; }   // cantidad canceladas en cascada
}
```

#### Business Rules

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-MAN-001` | 1 | — | `HoraFin <= HoraInicio` | `BadRequestException("[BR-MAN-001] HoraFin debe ser posterior a HoraInicio.")` |
| `BR-MAN-002` | 1 | — | `FechaFin <= FechaInicio` | `BadRequestException("[BR-MAN-002] FechaFin debe ser posterior a FechaInicio.")` |
| `BR-MAN-003` | 2 | RN-20 | Al crear mantenimiento | Buscar Reservas en los bloques afectados; cancelarlas en cascada (BR-MAN-004) |
| `BR-MAN-004` | 3 | RN-31 / RN-15 | Por cada Reserva cancelada | Notificar afectados; si `Tarifa > 0` → acreditar (igual que BR-INC-003) |

**Entidad nueva — `DiaExcepcional` (contingencia #8, feriados/aperturas extraordinarias, referenciada por `BR-DISP-016/017` de `SPEC-CU12`):**
```csharp
public class DiaExcepcional {
    public int      IDDiaExcepcional { get; set; }
    public int?     IDAmenity        { get; set; }  // FK nullable → null = todos los amenities del tenant
    public DateOnly Fecha            { get; set; }
    public string   Tipo             { get; set; }   // "FERIADO_CIERRA" | "APERTURA_EXTRAORDINARIA"
    public string?  Nota             { get; set; }
    public Amenity? Amenity          { get; set; }
}
```
```csharp
modelBuilder.Entity<DiaExcepcional>(e => {
    e.ToTable("PB_DiaExcepcional");
    e.HasKey(x => x.IDDiaExcepcional);
    e.HasIndex(x => new { x.IDAmenity, x.Fecha });
    e.HasOne(x => x.Amenity).WithMany().HasForeignKey(x => x.IDAmenity).OnDelete(DeleteBehavior.Cascade);
});
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IServiceAsync<MantenimientoProgramado>, MantenimientoService>();
```

#### Migración

```powershell
dotnet ef migrations add CU10_MantenimientoProgramado --output-dir Migrations
dotnet ef migrations script --output "scripts/007_CU10_MantenimientoProgramado.sql" --idempotent
```

---

---

## SPEC-CU14
### CU-14: Cancelación Masiva Administrativa por Amenity Fuera de Servicio

**Tipo:** Orquestador propio (no hereda `ServiceAsync<T>`) — transacción explícita sobre `Amenity` + `Reserva` + `ListaEspera`
**Estado:** 🔲 Pendiente (contingencia #5)
**Depende de:** SPEC-CU01, SPEC-CU05, SPEC-CU10
**Migración:** ninguna nueva — reutiliza campos ya existentes de `Reserva`/`ListaEspera`
**Actor:** `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR`

#### Propósito

Cuando un amenity queda fuera de servicio de un día para el otro (ej. rotura de la bomba de la pileta) con reservas ya confirmadas encima, este CU cancela en cascada, reembolsa automáticamente (sin aplicar la política escalonada de `BR-RES-015..017`, porque la cancelación no la originó el residente) y notifica a todos los afectados.

#### DTO

```csharp
public class CancelacionMasivaRequestDto {
    public int       IDAmenity                 { get; set; }
    public DateOnly  FechaDesde                { get; set; }
    public DateOnly? FechaHasta                { get; set; }   // opcional; default = sin límite hasta reactivación
    public string    MotivoAdmin               { get; set; }   // obligatorio, para auditoría/comunicado
    public bool      CancelarReservasAfectadas { get; set; }
}
```

#### Business Rules

| BR-ID | Condición | Acción |
|---|---|---|
| `BR-MAN-005` | `POST /Amenity/{id}/FueraDeServicio` con `CancelarReservasAfectadas = true` | Transacción explícita: 1) `Amenity.Estado = "FUERA_DE_SERVICIO"`; 2) buscar `Reserva` con `Estado IN ("Confirmed","Pending")` en el rango; 3) por cada una: `Estado = "Cancelled"`, `MotivoCancelacion = "FUERA_DE_SERVICIO_ADMINISTRATIVO"`, `DepositReturned = true` (reembolso 100% automático) |
| `BR-MAN-006` | Tras la transacción exitosa | Encolar notificación en cascada a cada afectado con `MotivoAdmin` como cuerpo — reutiliza el mecanismo de `RN-32` |
| `BR-MAN-007` | Alguna `Reserva` afectada tenía `ListaEspera` con hold `NOTIFICADO` vigente | El hold también expira: `MotivoExpiracion = "AMENITY_DESHABILITADO"`, sin ofrecerlo al siguiente de la fila |

#### Endpoint

```
POST /Amenity/{id}/FueraDeServicio
Body: CancelacionMasivaRequestDto
[Authorize(Roles = "ADMINISTRADOR_LIVIANO,ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]
```

---

---

## SPEC-CU11
### CU-11: Baja Inquilino / Cambio de Ocupante

**Tipo:** Método adicional en InquilinoService
**Estado:** 🔲 Pendiente
**Depende de:** ENT-06 (Inquilino — campo `Activo` ya definido)
**Actor:** `ADMINISTRADOR_LIVIANO`/`ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR` (cualquier unidad del tenant) / `PROPIETARIO` (solo de su(s) propia(s) unidad(es), vía `UsuarioUnidad`)

#### DTO

```csharp
// Input
public class BajaInquilinoDto { public int IDInquilino { get; set; } }

// Output
public class BajaInquilinoResponseDto {
    public int    IDInquilino          { get; set; }
    public int    IDUnidadHabitacional { get; set; }
    public bool   AccesoRevocado       { get; set; }
    public int    ReservasVinculadas   { get; set; }   // reservas que quedan vinculadas a la unidad
}
```

#### Business Rules

| BR-ID | P | RN | Condición | Acción |
|---|---|---|---|---|
| `BR-BAJ-001` | 1 | RN-44 | Siempre | `Inquilino.Activo = false`; invalidar token JWT del inquilino (tabla `PB_TokenRevocado`) |
| `BR-BAJ-002` | 2 | RN-44 | Las `Reserva` de la unidad | Permanecen asociadas a `IDUnidadHabitacional` (NO al `IDInquilino`); no se cancelan automáticamente |

#### Patrón de implementación

```csharp
// Agregar en InquilinoService:
public async Task<BajaInquilinoResponseDto> DarDeBaja(int idInquilino) {
    // 1. Cargar Inquilino; null → NotFoundException
    // 2. Inquilino.Activo = false; Update (BR-BAJ-001)
    // 3. Insert en PB_TokenRevocado para invalidar JWT activos del inquilino
    // 4. Contar Reserva activas futuras de la UnidadHabitacional (informativo — BR-BAJ-002)
    // 5. return BajaInquilinoResponseDto
}
```

#### Endpoint

```
POST /Inquilino/DarDeBaja
Body: BajaInquilinoDto → ServiceResponse<BajaInquilinoResponseDto>
```

---

---

## SPEC-NOTIF
### Notificaciones y Comunicaciones

**Tipo:** Cross-cutting — Port & Adapter
**Estado:** 🔲 Pendiente

#### Interface (Core)

```csharp
// Services/Ports/INotificationPort.cs
public interface INotificationPort {
    Task EnviarAsync(NotificacionDto notif);
}

public class NotificacionDto {
    public List<string> Destinatarios { get; set; }   // emails o device tokens
    public string       Canal         { get; set; }   // "EMAIL" | "PUSH" | "AMBOS"
    public string       Asunto        { get; set; }
    public string       Cuerpo        { get; set; }
    public string       TipoEvento    { get; set; }   // BR-NOT-ID de referencia
}
```

#### Notificaciones requeridas por CU

| BR-ID | RN | Trigger | Canal | Implementado en |
|---|---|---|---|---|
| `BR-NOT-001` | RN-30 | Reserva confirmada (job X horas antes) | Push + Email | Job background |
| `BR-NOT-002` | RN-31 | Cancelación automática por sistema | Push + Email | ReservaService, IncidenciaService, MantenimientoService |
| `BR-NOT-003` | RN-32 | Turno liberado → primera posición en lista espera | Push | ListaEsperaService |
| `BR-NOT-004` | RN-33 | Comunicado masivo del administrador | Push + Email | Endpoint propio en ReporteController o NotificacionController |
| `BR-NOT-005` | — | Notificación marcada `Urgente = true` (contingencia #7 — holds de lista de espera, cancelaciones masivas, aprobación con SLA corto) | Enviar `PUSH` primero; si no hay `Entregado = true` a los 5 min, enviar automáticamente por el siguiente canal (`EMAIL` → `WHATSAPP`, orden configurable por tenant) |
| `BR-NOT-006` | — | Todos los canales configurados fallaron (sin ack) | `Estado = "SIN_CONFIRMAR"`, visible en panel admin para intervención manual |

**Entidad nueva — `NotificacionIntento` (registro de fallback, contingencia #7):**
```csharp
public class NotificacionIntento {
    public int       IDIntento      { get; set; }
    public int       IDNotificacion { get; set; }   // FK → Notificacion
    public string    Canal          { get; set; }    // "PUSH" | "EMAIL" | "WHATSAPP" | "SMS"
    public DateTime  EnviadoEn      { get; set; }
    public bool      Entregado      { get; set; }    // ack del proveedor, si está disponible
    public DateTime? EntregadoEn    { get; set; }
}
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<INotificationPort, NotificationAdapter>();
builder.Services.AddScoped<IResidentNotificationPort, EmailNotificationAdapter>();
```

#### Migración

```powershell
dotnet ef migrations add NOTIF_IntentoFallback --output-dir Migrations
dotnet ef migrations script --output "scripts/notif_b_NotificacionIntento.sql" --idempotent
```

---

---

## SPEC-AUTH (v2)
### Autenticación, Roles y Sesiones — modelo de 6 roles confirmado

**Tipo:** Extensión del sistema JWT existente en ProyectoBase
**Estado:** 🔲 Pendiente
**Migración:** `008_CU_Auth_Usuarios` + `008b_AUTH_ModeloRolesV2_UsuarioUnidad`
**Base:** `AccountController` + `TokenService` + `appsettings.json:Jwt` ya implementados

> **Nota de versión:** esta sección reemplaza el modelo original de 4 roles (`RESIDENTE`/`GUARDIA`/`ADMINISTRADOR`/`SUPER_ADMINISTRADOR`) por el modelo de 6 roles confirmado con el negocio, que separa `ADMINISTRADOR` en dos niveles (liviano/avanzado, según si el consorcio tiene guardia dedicado) y separa `RESIDENTE` en `INQUILINO`/`PROPIETARIO` (el propietario puede tener más de una unidad y supervisar lo que hacen sus inquilinos). `INVITADO` se modela como rol con identidad propia y vigencia acotada. El claim `"RESIDENTE"` se mantiene como **grupo lógico** (`INQUILINO` + `PROPIETARIO`) en los `[Authorize]` ya escritos de `CU-01`/`CU-12`/`CU-05`/`CU-07`, para no tener que reescribir cada atributo existente.

#### Roles del sistema

| Rol (claim) | Condición de existencia | Permisos |
|---|---|---|
| `SUPER_ADMINISTRADOR` | Siempre | Acceso total cross-tenant (con bypass explícito del query filter de `TenantId`, `BR-AUTH-005`); alta de consorcios (`CU-08`); gestión de catálogo de presets de amenity global |
| `ADMINISTRADOR_AVANZADO` | Siempre | Gestión completa del propio tenant: `CU-08b`, `CU-06`, `CU-09`, `CU-10`, `CU-14`; no opera portería personalmente |
| `ADMINISTRADOR_LIVIANO` | Solo si `Consorcio.TieneGuardiaDedicado == false` | Día a día: aprobar/rechazar reservas (`CU-01`), bloquear amenity por incidencia puntual (`CU-04` parcial), y `CU-03` (portería) porque no hay guardia dedicado — **no** sanciona ni configura (`BR-AUTH-016`) |
| `GUARDIA` | Solo si `Consorcio.TieneGuardiaDedicado == true` | `CU-03` exclusivamente (+ `CU-02`, reportar incidencias detectadas, `BR-AUTH-007`) |
| `INQUILINO` | Siempre | `CU-01`, `CU-12`, `CU-05`, `CU-02`, `CU-07` — el residente operativo del día a día |
| `PROPIETARIO` | Siempre | Igual que `INQUILINO` si `UsuarioUnidad.EsOcupanteActual = true` en esa unidad, **más** supervisión de lectura (`BR-AUTH-010/011`) sobre todas sus unidades, aunque no viva en ellas |
| `INVITADO` | Siempre, vigencia acotada a la invitación | Solo lectura: su pase de acceso, reglamento, contacto con seguridad — ver enmienda de `Invitacion` abajo |

#### Entidades nuevas / enmendadas

```csharp
// Models/Rol.cs — Catálogo de roles del sistema
public class Rol {
    public int     IDRol        { get; set; }
    public string  Codigo       { get; set; }   // "SUPER_ADMINISTRADOR" | "ADMINISTRADOR_AVANZADO" | "ADMINISTRADOR_LIVIANO" | "GUARDIA" | "INQUILINO" | "PROPIETARIO" | "INVITADO"
    public string  Nombre       { get; set; }
    public string? Descripcion  { get; set; }
}

// Models/UsuarioRol.cs — Relación muchos-a-muchos (múltiples roles por usuario)
public class UsuarioRol {
    public int      IDUsuarioRol { get; set; }
    public int      IDUsuario    { get; set; }
    public int      IDRol        { get; set; }
    public Usuario  Usuario      { get; set; }
    public Rol      Rol          { get; set; }
}

// Models/Usuario.cs
public class Usuario {
    public int     IDUsuario    { get; set; }
    public string  Username     { get; set; }   // único
    public string  Email        { get; set; }   // único; usado como login
    public string  Password     { get; set; }   // almacena hash seguro en producción
    public bool    Activo       { get; set; }   // default: true
    public ICollection<UsuarioRol> UsuarioRoles { get; set; } = new List<UsuarioRol>();
}

// Models/UsuarioUnidad.cs — reemplaza el FK simple, muchos-a-muchos
public class UsuarioUnidad {
    public int       IDUsuarioUnidad      { get; set; }
    public int       IDUsuario            { get; set; }
    public int       IDUnidadHabitacional { get; set; }
    public string    TipoRelacion         { get; set; }   // "PROPIETARIO" | "INQUILINO"
    public bool      EsOcupanteActual     { get; set; }    // true = vive ahí y opera CU-01; false = propietario ausente que solo supervisa
    public DateTime  FechaInicio          { get; set; }
    public DateTime? FechaFin             { get; set; }    // null = vigente
    public Usuario             Usuario             { get; set; }
    public UnidadHabitacional UnidadHabitacional { get; set; }
}

// Models/TokenRevocado.cs — sin cambios
public class TokenRevocado {
    public int      IDTokenRevocado { get; set; }
    public string   Jti             { get; set; }
    public DateTime Expiracion      { get; set; }
}
```

```csharp
modelBuilder.Entity<Rol>(e => {
    e.ToTable("PB_Rol");
    e.HasKey(x => x.IDRol);
    e.Property(x => x.Codigo).IsRequired().HasMaxLength(30);
    e.HasIndex(x => x.Codigo).IsUnique();
    e.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
    e.Property(x => x.Descripcion).HasMaxLength(250);
});

modelBuilder.Entity<UsuarioRol>(e => {
    e.ToTable("PB_UsuarioRol");
    e.HasKey(x => x.IDUsuarioRol);
    e.HasIndex(x => new { x.IDUsuario, x.IDRol }).IsUnique();
    e.HasOne(x => x.Usuario).WithMany(u => u.UsuarioRoles).HasForeignKey(x => x.IDUsuario).OnDelete(DeleteBehavior.Cascade);
    e.HasOne(x => x.Rol).WithMany().HasForeignKey(x => x.IDRol).OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<Usuario>(e => {
    e.ToTable("PB_Usuario");
    e.HasKey(x => x.IDUsuario);
    e.Property(x => x.Username).IsRequired().HasMaxLength(100);
    e.HasIndex(x => x.Username).IsUnique();
    e.Property(x => x.Email).IsRequired().HasMaxLength(250);
    e.HasIndex(x => x.Email).IsUnique();
    e.Property(x => x.Password).IsRequired().HasMaxLength(255);
    e.Property(x => x.Activo).HasDefaultValue(true);
});

modelBuilder.Entity<UsuarioUnidad>(e => {
    e.ToTable("PB_UsuarioUnidad");
    e.HasKey(x => x.IDUsuarioUnidad);
    e.HasIndex(x => new { x.IDUsuario, x.IDUnidadHabitacional, x.TipoRelacion }).IsUnique()
     .HasFilter("\"FechaFin\" IS NULL");
    e.Property(x => x.TipoRelacion).IsRequired().HasMaxLength(20);
    e.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.IDUsuario).OnDelete(DeleteBehavior.Cascade);
    e.HasOne(x => x.UnidadHabitacional).WithMany().HasForeignKey(x => x.IDUnidadHabitacional).OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<TokenRevocado>(e => {
    e.ToTable("PB_TokenRevocado");
    e.HasKey(x => x.IDTokenRevocado);
    e.Property(x => x.Jti).IsRequired().HasMaxLength(100);
    e.HasIndex(x => x.Jti).IsUnique();
    e.Property(x => x.Expiracion).IsRequired().HasColumnType("timestamptz");
});
```

#### Business Rules

| BR-ID | Regla |
|---|---|
| `BR-AUTH-001` | `AccountController.Login` valida email+password; retorna JWT con `ClaimTypes.Name`, `ClaimTypes.Role`, `Jti` |
| `BR-AUTH-002` | Decorar cada endpoint con `[Authorize(Roles = "...")]` según tabla de roles — `"RESIDENTE"` como grupo lógico se resuelve como policy `INQUILINO,PROPIETARIO` |
| `BR-AUTH-003` | Middleware valida `Jti` contra `PB_TokenRevocado` en cada request; si existe → `401` |
| `BR-AUTH-004` | Al ejecutar `DarDeBaja` (CU-11) → Insert en `PB_TokenRevocado` con todos los `Jti` activos del usuario |
| `BR-AUTH-005` | `Rol == "SUPER_ADMINISTRADOR"` y la acción normalmente está scopeada por `TenantId` | Bypass explícito del `HasQueryFilter` global de EF Core, parametrizado por `tenantId` recibido en ruta/query |
| `BR-AUTH-006` | `Rol == "ADMINISTRADOR_AVANZADO"` y la acción es alta/edición de `Amenity`/`AmenityConfig` de un consorcio **ya activo** (no el alta inicial de `CU-08`) | Permitir — se modela como `CU-08b`, separado del alta de tenant (`CU-08`, exclusivo `SUPER_ADMINISTRADOR`) |
| `BR-AUTH-007` | `Rol == "GUARDIA"` y la acción es `POST /Incidencia` | Permitir — gap resuelto, ver enmienda de `SPEC-CU02` |
| `BR-AUTH-008` | Alta de `Usuario` con `Rol == "INVITADO"` | Se crea con `PasswordHash = null` y vigencia atada a una `Invitacion` (`FechaFin = Invitacion.FechaVencimiento`); autenticación vía magic-link/token de un solo uso, no login tradicional — ver enmienda de `ENT` Invitacion en `SPEC-CU03` |
| `BR-AUTH-009` | — | `UsuarioUnidad.TipoRelacion` distingue `PROPIETARIO` de `INQUILINO`; reemplaza cualquier lógica que asumiera un único FK fijo |
| `BR-AUTH-010` | `Rol == "PROPIETARIO"` consulta `GET /Propietario/MisUnidades` | Devuelve todas las `UnidadHabitacional` con `UsuarioUnidad.TipoRelacion = "PROPIETARIO"` vigente, con resumen agregado por unidad (reservas activas, incidencias abiertas, sanciones vigentes del inquilino actual) |
| `BR-AUTH-011` | `Rol == "PROPIETARIO"` consulta reservas/incidencias/sanciones de una unidad donde no tiene `UsuarioUnidad` vigente | `403` — la supervisión es sobre lo propio, no sobre cualquier unidad del consorcio |
| `BR-AUTH-012` | Se registra incidencia (`CU-02`) o sanción (`CU-06`) sobre una unidad con `PROPIETARIO` vigente y `EsOcupanteActual = false` | Notificar también al propietario (amplía `RN-31`) |
| `BR-AUTH-013` | `UnidadHabitacional.RequiereAprobacionPropietario == true` y quien crea la reserva es `INQUILINO` | Reserva queda `"PendienteAprobacionPropietario"` hasta `POST /Reserva/{id}/AprobarPropietario` — puede coexistir en cascada con `"PENDIENTE_APROBACION"` del admin (`RN-35`) |
| `BR-AUTH-014` | `Consorcio.TieneGuardiaDedicado == false` | `CU-03` bajo `[Authorize(Roles="ADMINISTRADOR_LIVIANO,ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]` — no existe `GUARDIA` para ese tenant |
| `BR-AUTH-015` | `Consorcio.TieneGuardiaDedicado == true` | `CU-03` bajo `[Authorize(Roles="GUARDIA,ADMINISTRADOR_AVANZADO,SUPER_ADMINISTRADOR")]` — `ADMINISTRADOR_LIVIANO` no debería existir en ese tenant (configuraciones mutuamente excluyentes por tamaño de edificio) |
| `BR-AUTH-016` | `Rol == "ADMINISTRADOR_LIVIANO"` intenta `CU-06`, `CU-08b`, `CU-09` (reporte formal) o `CU-10` | `403` — reservado a `ADMINISTRADOR_AVANZADO`/`SUPER_ADMINISTRADOR` |

**Regla técnica (rate limiting, contingencia #12):**

| RT-ID | Alcance | Acción |
|---|---|---|
| `RT-SEC-001` | `POST /ListaEspera`, `POST /Reserva`, `POST /ListaEspera/{id}/Confirmar` | Middleware `Microsoft.AspNetCore.RateLimiting` (nativo .NET 8), policy `SlidingWindow` por `IDUsuario`: 10 req/min |
| `RT-SEC-002` | Excede el límite | `429 Too Many Requests` a nivel de middleware, no excepción de dominio |

```csharp
builder.Services.AddRateLimiter(options => {
    options.AddPolicy("reservas-criticas", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.User.FindFirst("IDUsuario")?.Value ?? "anon",
            factory: _ => new SlidingWindowRateLimiterOptions {
                PermitLimit = 10, Window = TimeSpan.FromMinutes(1), SegmentsPerWindow = 4
            }));
});
```

#### Registro Program.cs

```csharp
builder.Services.AddScoped<IServiceAsync<Usuario>, ServiceAsync<Usuario>>();
builder.Services.AddScoped<IServiceAsync<UsuarioUnidad>, ServiceAsync<UsuarioUnidad>>();
builder.Services.AddScoped<IServiceAsync<TokenRevocado>, ServiceAsync<TokenRevocado>>();
```

#### Migración

```powershell
dotnet ef migrations add Auth_UsuariosTokenRevocado --output-dir Migrations
dotnet ef migrations script --output "scripts/008_Auth_UsuariosTokenRevocado.sql" --idempotent
dotnet ef migrations add AUTH_ModeloRolesV2_UsuarioUnidad --output-dir Migrations
dotnet ef migrations script --output "scripts/008b_AUTH_ModeloRolesV2.sql" --idempotent
```

> **Riesgo a marcar para backend:** si ya hay datos con el modelo viejo (`Usuario.IDUnidadHabitacional` simple), la migración `008b` necesita un paso de *backfill* que cree un `UsuarioUnidad` (`TipoRelacion = "INQUILINO"` por defecto) por cada `Usuario` existente antes de que el código nuevo dependa de la tabla intermedia — no es un simple `ALTER TABLE`.

#### Pendiente de confirmación

El rol `INVITADO` se modeló como **Opción B** (identidad propia, vigencia acotada, `BR-AUTH-008`) porque el negocio lo contó como uno de los 6 roles reales. Si en algún momento se prefiere la alternativa más liviana (link temporal sin `Usuario` en absoluto, sin claim de rol), `BR-AUTH-008` y la entidad `Invitacion` de `CU-03` cambian de diseño — avisar antes de implementar si ese es el caso.

---

## Orden de Implementación por Fases

```
Fase 1 — Base (ya completada)
  SPEC-ARCH  →  SPEC-ENT (ENT-01..05)  →  SPEC-CU08

Fase 2 — Auth + Core funcional
  SPEC-AUTH (v2, 6 roles)  →  SPEC-CU12  →  SPEC-CU01 (+ contingencias #1, #2, #4)  →  SPEC-CU02  →  SPEC-CU04

Fase 3 — Operaciones avanzadas
  SPEC-CU03  →  SPEC-CU05 (ampliado, + contingencias #3, #6)  →  SPEC-CU06  →  SPEC-CU07  →  SPEC-CU14 (contingencia #5)

Fase 4 — Administración y reporting
  SPEC-CU09 (+ contingencia #10)  →  SPEC-CU10 (+ contingencia #8)  →  SPEC-CU11  →  SPEC-NOTIF (+ contingencia #7)
  →  contingencia #11 (overbooking, al final, requiere datos históricos de #1)

Transversal, en paralelo a cualquier fase:
  contingencia #12 (rate limiting, RT-SEC-001) — se agrega al middleware existente, no bloquea otras fases
```

