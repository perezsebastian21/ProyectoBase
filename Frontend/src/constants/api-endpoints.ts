/**
 * API Endpoints Configuration
 *
 * URLs del backend centralizadas. Se combinan con la BASE_URL
 * definida en las variables de entorno.
 *
 * Uso:
 *   import { API_ENDPOINTS } from '@/constants';
 *   const response = await apiClient.get(API_ENDPOINTS.AMENITIES.LIST);
 */

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/api/health',

  // Auth
  AUTH: {
    LOGIN: '/account/login',
    REGISTER: '/account/register',
    LOGOUT: '/account/logout',
    REFRESH: '/account/refresh',
    ME: '/account/me',
  },

  // Amenities
  AMENITIES: {
    LIST: '/api/amenities',
    DETAIL: (id: string) => `/api/amenities/${id}` as const,
    CREATE: '/api/amenities',
    UPDATE: (id: string) => `/api/amenities/${id}` as const,
    DELETE: (id: string) => `/api/amenities/${id}` as const,
  },

  // Incidents
  INCIDENTS: {
    LIST: '/api/incidents',
    DETAIL: (id: string) => `/api/incidents/${id}` as const,
    CREATE: '/api/incidents',
    UPDATE: (id: string) => `/api/incidents/${id}` as const,
  },

  // Reservations
  RESERVATIONS: {
    LIST: '/api/reservations',
    DETAIL: (id: string) => `/api/reservations/${id}` as const,
    CREATE: '/api/reservations',
    CANCEL: (id: string) => `/api/reservations/${id}/cancel` as const,
  },
} as const;
