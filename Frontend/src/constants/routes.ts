/**
 * Application Routes
 *
 * Definición centralizada de todas las rutas de la aplicación.
 */

export const ROUTES = {
  // Auth & Onboarding
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  SELECT_ROLE: '/select-role',
  INVITACION: '/invitacion',

  // Main
  HOME: '/',
  DASHBOARD: '/',

  // Amenities & Residentes (CU-12 / CU-01 / CU-05)
  DISPONIBILIDAD: '/dashboard/disponibilidad',
  ACCESO: '/dashboard/acceso',
  MIS_UNIDADES: '/dashboard/mis-unidades',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Administration (Consorcios / Complejos / Invitaciones)
  CONSORCIOS: '/dashboard/consorcios',
  COMPLEJOS: '/dashboard/complejos',
  GESTION_INVITACIONES: '/dashboard/invitaciones',
  APROBACIONES_VINCULACION: '/dashboard/aprobaciones-vinculacion',
  ADMINISTRADORES: '/dashboard/administradores',

  // ABMs & Módulos
  PERSONAS: '/dashboard/personas',
  UNIDADES: '/dashboard/unidades',
  INQUILINOS: '/dashboard/inquilinos',
  INVITADOS: '/dashboard/invitados',
  AMENITIES_ADMIN: '/dashboard/amenities',
  AMENITY_CONFIG: '/dashboard/amenity-config',
  RESERVAS_ADMIN: '/dashboard/reservas',
  LISTAS_ESPERA: '/dashboard/listas-espera',
  INCIDENCIAS_ADMIN: '/dashboard/incidencias',
  MANTENIMIENTOS: '/dashboard/mantenimientos',
  AUDIT_LOGS: '/dashboard/audit-logs',
} as const;
