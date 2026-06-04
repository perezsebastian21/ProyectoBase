# 📁 Estructura del Frontend — Amenities App

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 16.2.6 | Framework React con App Router |
| React | 19.2.4 | Librería UI |
| TypeScript | ^5 | Tipado estático |
| Tailwind CSS | ^4 | Utilidades de estilos |

---

## Estructura de Carpetas

```
src/
├── app/                          # 🔀 RUTAS (App Router de Next.js)
│   ├── (auth)/                   # Grupo: rutas de autenticación (sin navbar)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                   # Grupo: rutas principales (con navbar)
│   │   ├── layout.tsx            # Layout con TopAppBar + BottomNavBar
│   │   ├── dashboard/page.tsx
│   │   ├── amenities/page.tsx
│   │   ├── incidents/page.tsx
│   │   └── reservations/page.tsx
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Root layout
│   ├── manifest.ts               # PWA manifest
│   ├── not-found.tsx             # Página 404
│   ├── loading.tsx               # Loading global
│   └── error.tsx                 # Error boundary global
│
├── components/                   # 🧩 COMPONENTES COMPARTIDOS
│   ├── ui/                       # Design System (primitivos)
│   │   ├── PrimaryButton.tsx
│   │   ├── IconButton.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── StatusBadge.tsx
│   │   └── index.ts
│   ├── layout/                   # Estructura visual de la app
│   │   ├── TopAppBar.tsx
│   │   ├── BottomNavBar.tsx
│   │   └── index.ts
│   ├── feedback/                 # Interacción con el usuario
│   │   ├── InstallPrompt.tsx
│   │   ├── PushNotificationManager.tsx
│   │   └── index.ts
│   └── providers/                # React Context Providers
│       ├── AuthProvider.tsx
│       ├── ThemeProvider.tsx
│       └── index.ts
│
├── features/                     # 🏗️ MÓDULOS POR DOMINIO
│   ├── amenities/                # Todo sobre amenities
│   │   ├── components/           # Componentes específicos
│   │   ├── hooks/                # Hooks específicos
│   │   ├── services/             # API calls específicos
│   │   ├── types/                # Tipos e interfaces
│   │   └── index.ts              # Barrel export
│   ├── incidents/                # Todo sobre incidentes
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── dashboard/                # Todo sobre el dashboard
│   │   ├── components/
│   │   └── index.ts
│   ├── reservations/             # Todo sobre reservas
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── health/                   # Monitoreo del backend
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.ts
│
├── hooks/                        # 🪝 HOOKS GLOBALES
│   ├── useBackendHealth.ts
│   └── index.ts
│
├── lib/                          # 📚 INFRAESTRUCTURA
│   └── api-client.ts             # Cliente HTTP base (fetch wrapper)
│
├── types/                        # 📋 TIPOS GLOBALES
│   └── index.ts                  # ApiResponse, User, PaginationParams, etc.
│
├── constants/                    # 📌 CONSTANTES DE LA APP
│   ├── routes.ts                 # Rutas de navegación
│   ├── api-endpoints.ts          # URLs del backend
│   ├── app.ts                    # Config general
│   └── index.ts
│
└── styles/                       # 🎨 ESTILOS ADICIONALES
    ├── variables.css              # Design tokens (colores, spacing, etc.)
    └── animations.css             # Animaciones reutilizables
```

---

## Principios de Organización

### 1. `app/` — Solo para ruteo

La carpeta `app/` contiene **exclusivamente** archivos especiales de Next.js:

| Archivo | Propósito |
|---|---|
| `page.tsx` | Define una ruta navegable |
| `layout.tsx` | Layout compartido entre rutas hijas |
| `loading.tsx` | UI de carga (React Suspense) |
| `error.tsx` | Error boundary |
| `not-found.tsx` | Página 404 |
| `route.ts` | API Route Handler |

> ⚠️ **NUNCA** pongas componentes, hooks, utils ni lógica de negocio dentro de `app/`.

### 2. Route Groups `(nombre)`

Los paréntesis en nombres de carpetas crean **grupos de rutas** que:
- Comparten un `layout.tsx` sin afectar la URL
- Permiten separar secciones con diferentes estructuras visuales

```
(auth)/login/page.tsx     → URL: /login      (sin navbar)
(main)/dashboard/page.tsx → URL: /dashboard   (con navbar)
```

### 3. `features/` — Feature-based Architecture

Cada dominio de negocio tiene su propia carpeta autocontenida:

```
features/amenities/
├── components/AmenityCard.tsx    ← UI específica de amenities
├── hooks/useAmenities.ts         ← Lógica de datos
├── services/amenityService.ts    ← Comunicación con API
├── types/amenity.types.ts        ← Interfaces TypeScript
└── index.ts                      ← Export público
```

**Regla de oro:** si un archivo solo lo usa un feature → va dentro del feature.
Si lo comparten múltiples features → va en la carpeta global correspondiente.

### 4. `components/` — Componentes compartidos

Organizados por **tipo de responsabilidad**, no por dominio:

| Subcarpeta | Qué contiene | Ejemplos |
|---|---|---|
| `ui/` | Primitivos del Design System | Button, Badge, Input, Modal |
| `layout/` | Estructura visual | TopAppBar, BottomNavBar, Sidebar |
| `feedback/` | Interacción/notificación | Toast, InstallPrompt, Alert |
| `providers/` | Context Providers | AuthProvider, ThemeProvider |

### 5. `lib/` — Infraestructura

Utilidades de infraestructura que **no son componentes React**:
- `api-client.ts` — Wrapper de `fetch` con interceptors
- `auth.ts` — Utilidades de autenticación (tokens, session)
- `utils.ts` — Helpers genéricos (formatDate, cn, etc.)

### 6. `constants/` — Configuración centralizada

Evita strings hardcodeados en el código:

```typescript
// ❌ Malo
router.push('/amenities');
fetch('/api/amenities');

// ✅ Bueno
import { ROUTES, API_ENDPOINTS } from '@/constants';
router.push(ROUTES.AMENITIES);
fetch(API_ENDPOINTS.AMENITIES.LIST);
```

### 7. `types/` — Tipos globales

Tipos TypeScript compartidos entre múltiples features:
- `ApiResponse<T>` — Respuesta genérica de la API
- `PaginatedResponse<T>` — Respuesta paginada
- `User` — Modelo de usuario
- `PaginationParams` — Parámetros de paginación

Los tipos específicos de un feature van en `features/[feature]/types/`.

### 8. `styles/` — Design Tokens y Animaciones

| Archivo | Contenido |
|---|---|
| `variables.css` | Custom properties: colores, tipografía, spacing, sombras, z-index |
| `animations.css` | Keyframes y clases de animación reutilizables |

---

## Convenciones de Código

### Imports con path aliases

```typescript
// Usar alias @/ en lugar de rutas relativas largas
import { PrimaryButton } from '@/components/ui';
import { AmenityCard } from '@/features/amenities';
import { ROUTES } from '@/constants';
import type { User } from '@/types';
```

### Barrel Exports (index.ts)

Cada carpeta tiene un `index.ts` que exporta su API pública:

```typescript
// features/amenities/index.ts
export { AmenityCard } from './components/AmenityCard';
export { useAmenities } from './hooks/useAmenities';
export type { Amenity } from './types/amenity.types';
```

### Nomenclatura de archivos

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `AmenityCard.tsx` |
| Hooks | camelCase con `use` | `useAmenities.ts` |
| Services | camelCase con `Service` | `amenityService.ts` |
| Types | camelCase con `.types` | `amenity.types.ts` |
| Constants | camelCase | `routes.ts`, `app.ts` |
| Styles | kebab-case | `variables.css` |

### Client vs Server Components

```typescript
// Server Component (default en Next.js App Router)
// No necesita directiva — se ejecuta en el servidor
export default function AmenitiesPage() { ... }

// Client Component — necesita la directiva "use client"
'use client';
export default function AmenityCard() { ... }
```

---

## Cómo agregar un nuevo Feature

1. Crear la carpeta en `src/features/[nombre]/`
2. Crear las subcarpetas: `components/`, `hooks/`, `services/`, `types/`
3. Crear el `index.ts` con los barrel exports
4. Crear la ruta en `src/app/(main)/[nombre]/page.tsx`
5. Agregar la ruta a `src/constants/routes.ts`
6. Agregar los endpoints a `src/constants/api-endpoints.ts`
