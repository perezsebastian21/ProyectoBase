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

  // Consorcios
  CONSORCIO: {
    GET_ALL: '/consorcio/getall',
    GET_BY_ID: (id: number) => `/consorcio/GetById?id=${id}` as const,
    FIND_QP: '/consorcio/FindQP',
    CREATE: '/consorcio',
    UPDATE: '/consorcio',
    DELETE: (id: number) => `/consorcio/${id}` as const,
  },

  // Complejos
  COMPLEJO: {
    GET_ALL: '/complejo/getall',
    GET_BY_ID: (id: number) => `/complejo/GetById?id=${id}` as const,
    FIND_QP: '/complejo/FindQP',
    CREATE: '/complejo',
    UPDATE: '/complejo',
    DELETE: (id: number) => `/complejo/${id}` as const,
  },
} as const;
