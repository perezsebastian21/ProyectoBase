/**
 * Application Routes
 *
 * Definición centralizada de todas las rutas de la aplicación.
 * Usar estas constantes en lugar de strings hardcodeados.
 *
 * Uso:
 *   import { ROUTES } from '@/constants';
 *   router.push(ROUTES.AMENITIES);
 *   router.push(ROUTES.AMENITY_DETAIL('123'));
 */

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Main
  HOME: '/',
  DASHBOARD: '/',

  // Amenities
  AMENITIES: '/amenities',
  AMENITY_DETAIL: (id: string) => `/amenities/${id}` as const,

  // Incidents
  INCIDENTS: '/incidents',
  INCIDENT_DETAIL: (id: string) => `/incidents/${id}` as const,
  INCIDENT_NEW: '/incidents/new',

  // Reservations
  RESERVATIONS: '/reservations',
  RESERVATION_DETAIL: (id: string) => `/reservations/${id}` as const,
  RESERVATION_NEW: '/reservations/new',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Administration (Consorcios / Complejos)
  CONSORCIOS: '/dashboard/consorcios',
  COMPLEJOS: '/dashboard/complejos',

  // Nuevos ABM
  PERSONAS: '/dashboard/personas',
  UNIDADES: '/dashboard/unidades',
  INQUILILNOS: '/dashboard/inquilinos',
  INVITADOS: '/dashboard/invitados',
  AMENITIES_ADMIN: '/dashboard/amenities',
  AMENITY_CONFIG: '/dashboard/amenity-config',
  RESERVAS_ADMIN: '/dashboard/reservas',
  LISTAS_ESPERA: '/dashboard/listas-espera',
  INCIDENCIAS_ADMIN: '/dashboard/incidencias',
  MANTENIMIENTOS: '/dashboard/mantenimientos',
  AUDIT_LOGS: '/dashboard/audit-logs',
} as const;
