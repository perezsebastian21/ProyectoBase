# Plan de Implementación — Etapa 2: Entidades Faltantes

## 🔍 Análisis del Estado Actual
Revisé la carpeta de modelos y tu base de datos local. Al parecer te confundiste un poco con otro proyecto, porque actualmente solo tenemos implementadas las siguientes entidades en este backend:
- `Persona` y `Usuario` (del esquema base inicial)
- `Consorcio` y `Complejo` (implementadas en la Etapa 1)

Según el `modelo.jpeg` y las especificaciones de `specs (2)(2)(1).md`, **faltan implementar 10 entidades** para completar el esquema relacional de la aplicación.

---

## 🎯 Objetivo de la Etapa 2
Completar el mapeo de la base de datos (POCOs y Fluent API) y los endpoints CRUD (Controladores Genéricos) para todas las entidades faltantes, yendo desde las relaciones padre hacia las relaciones hijo.

Se proponen las siguientes **Fases de Implementación** dentro de esta etapa para no sobrecargar una única migración y asegurar que las FKs se construyan correctamente:

### Fase 2.1: Estructura del Complejo
Son las entidades que dependen directamente del `Complejo` ya creado.
1. **`UnidadHabitacional`** (ENT-03): Representa los departamentos o lotes. (FK a Complejo).
2. **`Amenity`** (ENT-04): Representa los espacios comunes (SUM, parrilla, etc.). (FK a Complejo).
3. **`AmenityConfig`** (ENT-05): Configuración 1-a-1 de cada amenity (horarios, tarifas, capacidades). (FK a Amenity).

### Fase 2.2: Ocupantes y Visitas
Dependen de la `UnidadHabitacional`.
4. **`Inquilino`** (ENT-06): Representa a las personas que viven en la unidad y pueden reservar. (FK a UnidadHabitacional).
5. **`Invitado`** (ENT-07): Representa a las visitas autorizadas para el control de acceso. (FK a UnidadHabitacional).

### Fase 2.3: Capa Transaccional (Operaciones)
Son las entidades donde recae la lógica fuerte del negocio; enlazan Amenity y Unidad.
6. **`Reserva`** (ENT-08): Reserva de un amenity por parte de una unidad. (FK a Amenity y UnidadHabitacional).
7. **`ListaEspera`** (ENT-10): Cola de espera para reservas. (FK a Amenity y UnidadHabitacional).
8. **`Incidencia`** (ENT-09): Reportes de daños o problemas. (FK a Amenity y UnidadHabitacional).
9. **`MantenimientoProgramado`** (ENT-11): Bloqueos administrativos de amenities. (FK a Amenity).

### Fase 2.4: Auditoría
10. **`AuditLog`** (ENT-12): Tabla independiente para registrar acciones del sistema.

---

## 🛠️ Detalle de Tareas Técnicas (Para cada Fase)

Para cada una de las 10 entidades, el flujo técnico estricto será:

1. **Modelos (`Models/`):**
   - Crear la clase C# (POCO) sin DataAnnotations, con las propiedades y las referencias de navegación (ej. `public Complejo Complejo { get; set; }`).

2. **ApplicationDbContext (`Models/ApplicationDbContext.cs`):**
   - Agregar el `public DbSet<T> Entidades { get; set; }`.
   - En `OnModelCreating`, configurar el Fluent API basándonos estrictamente en los snippets de las specs:
     - Nombres de tabla con prefijo `PB_`.
     - Constraints de longitud y obligatoriedad.
     - Índices únicos compuestos cuando aplique.
     - Relaciones `HasOne().WithMany().HasForeignKey().OnDelete(DeleteBehavior.Restrict)`.

3. **Controladores (`Controllers/`):**
   - Crear el controlador `[Entity]Controller` heredando de `GenericControllerAsync<[Entity]>`. Esto expondrá instantáneamente los endpoints GET, POST, PUT, DELETE.

4. **Migraciones (`dotnet ef migrations add`):**
   - Al finalizar cada Fase (o al final de toda la Etapa 2, según definamos), crear la migración.
   - Generar el script SQL correspondiente y guardarlo en la carpeta `/scripts`.

---

## ❓ Preguntas Abiertas para Ti

**Estrategia de Migración:**
1. ¿Prefieres que hagamos todo el código de las 10 entidades juntas y generemos **UNA SOLA GRAN MIGRACIÓN** (ej: `003_Etapa2_EntidadesFaltantes`)? 
2. ¿O prefieres que lo hagamos iterativamente (Fase 2.1, probamos, luego 2.2, etc.) y generemos **4 migraciones separadas**? 

*Ambas opciones son válidas, pero la opción 1 es más rápida si ya confías en la arquitectura.*
