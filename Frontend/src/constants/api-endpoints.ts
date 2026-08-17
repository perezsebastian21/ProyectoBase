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

  // Roles de Usuario
  ROL: {
    GET_ALL: '/Rol',
    GET_BY_USUARIO: (idUsuario: number) => `/Usuario/${idUsuario}/Roles` as const,
    ASIGNAR: (idUsuario: number) => `/Usuario/${idUsuario}/Roles` as const,
    REMOVER: (idUsuario: number, idRol: number) => `/Usuario/${idUsuario}/Roles/${idRol}` as const,
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

  // Unidades Habitacionales
  UNIDAD_HABITACIONAL: {
    GET_ALL: '/UnidadHabitacional/getall',
    GET_BY_ID: (id: number) => `/UnidadHabitacional/GetById?id=${id}` as const,
    FIND_QP: '/UnidadHabitacional/FindQP',
    CREATE: '/UnidadHabitacional',
    UPDATE: '/UnidadHabitacional',
    DELETE: (id: number) => `/UnidadHabitacional/${id}` as const,
  },

  // Usuarios
  USUARIO: {
    GET_ALL: '/Usuario/getall',
    GET_BY_ID: (id: number) => `/Usuario/GetById?id=${id}` as const,
    FIND_QP: '/Usuario/FindQP',
    CREATE: '/Usuario',
    UPDATE: '/Usuario',
    DELETE: (id: number) => `/Usuario/${id}` as const,
  },

  // Personas
  PERSONA: {
    GET_ALL: '/Persona/getall',
    GET_BY_ID: (id: number) => `/Persona/GetById?id=${id}` as const,
    FIND_QP: '/Persona/FindQP',
    CREATE: '/Persona',
    UPDATE: '/Persona',
    DELETE: (id: number) => `/Persona/${id}` as const,
  },

  // Inquilinos
  INQUILINO: {
    GET_ALL: '/Inquilino/getall',
    GET_BY_ID: (id: number) => `/Inquilino/GetById?id=${id}` as const,
    FIND_QP: '/Inquilino/FindQP',
    CREATE: '/Inquilino',
    UPDATE: '/Inquilino',
    DELETE: (id: number) => `/Inquilino/${id}` as const,
  },

  // Invitados
  INVITADO: {
    GET_ALL: '/Invitado/getall',
    GET_BY_ID: (id: number) => `/Invitado/GetById?id=${id}` as const,
    FIND_QP: '/Invitado/FindQP',
    CREATE: '/Invitado',
    UPDATE: '/Invitado',
    DELETE: (id: number) => `/Invitado/${id}` as const,
  },
  // Amenities
  AMENITY: {
    GET_ALL: '/Amenity/getall',
    GET_BY_ID: (id: number) => `/Amenity/GetById?id=${id}` as const,
    FIND_QP: '/Amenity/FindQP',
    CREATE: '/Amenity',
    UPDATE: '/Amenity',
    DELETE: (id: number) => `/Amenity/${id}` as const,
  },

  // AmenityConfig
  AMENITY_CONFIG: {
    GET_ALL: '/AmenityConfig/getall',
    GET_BY_ID: (id: number) => `/AmenityConfig/GetById?id=${id}` as const,
    FIND_QP: '/AmenityConfig/FindQP',
    CREATE: '/AmenityConfig',
    UPDATE: '/AmenityConfig',
    DELETE: (id: number) => `/AmenityConfig/${id}` as const,
  },

  // AuditLog
  AUDIT_LOG: {
    GET_ALL: '/AuditLog/getall',
    GET_BY_ID: (id: number) => `/AuditLog/GetById?id=${id}` as const,
    FIND_QP: '/AuditLog/FindQP',
    CREATE: '/AuditLog',
    UPDATE: '/AuditLog',
    DELETE: (id: number) => `/AuditLog/${id}` as const,
  },

  // Reservas
  RESERVA: {
    GET_ALL: '/Reserva/getall',
    GET_BY_ID: (id: number) => `/Reserva/GetById?id=${id}` as const,
    FIND_QP: '/Reserva/FindQP',
    CREATE: '/Reserva',
    UPDATE: '/Reserva',
    DELETE: (id: number) => `/Reserva/${id}` as const,
  },

  // Listas de Espera
  LISTA_ESPERA: {
    GET_ALL: '/ListaEspera/getall',
    GET_BY_ID: (id: number) => `/ListaEspera/GetById?id=${id}` as const,
    FIND_QP: '/ListaEspera/FindQP',
    CREATE: '/ListaEspera',
    UPDATE: '/ListaEspera',
    DELETE: (id: number) => `/ListaEspera/${id}` as const,
  },

  // Incidencias
  INCIDENCIA: {
    GET_ALL: '/Incidencia/getall',
    GET_BY_ID: (id: number) => `/Incidencia/GetById?id=${id}` as const,
    FIND_QP: '/Incidencia/FindQP',
    CREATE: '/Incidencia',
    UPDATE: '/Incidencia',
    DELETE: (id: number) => `/Incidencia/${id}` as const,
  },

  // Mantenimientos Programados
  MANTENIMIENTO: {
    GET_ALL: '/MantenimientoProgramado/getall',
    GET_BY_ID: (id: number) => `/MantenimientoProgramado/GetById?id=${id}` as const,
    FIND_QP: '/MantenimientoProgramado/FindQP',
    CREATE: '/MantenimientoProgramado',
    UPDATE: '/MantenimientoProgramado',
    DELETE: (id: number) => `/MantenimientoProgramado/${id}` as const,
  },

  // Usuario - Unidad (Relación N:M Propietario/Inquilino)
  USUARIO_UNIDAD: {
    GET_ALL: '/UsuarioUnidad/getall',
    GET_BY_ID: (id: number) => `/UsuarioUnidad/GetById?id=${id}` as const,
    FIND_QP: '/UsuarioUnidad/FindQP',
    CREATE: '/UsuarioUnidad',
    DELETE: (id: number) => `/UsuarioUnidad/${id}` as const,
  },

  // Políticas de Cancelación (Tramos de Penalidad)
  POLITICA_CANCELACION: {
    GET_ALL: '/PoliticaCancelacionTramo/getall',
    GET_BY_ID: (id: number) => `/PoliticaCancelacionTramo/GetById?id=${id}` as const,
    FIND_QP: '/PoliticaCancelacionTramo/FindQP',
    CREATE: '/PoliticaCancelacionTramo',
    UPDATE: '/PoliticaCancelacionTramo',
    DELETE: (id: number) => `/PoliticaCancelacionTramo/${id}` as const,
  },

  // Notificación Intentos
  NOTIFICACION_INTENTO: {
    GET_ALL: '/NotificacionIntento/getall',
    GET_BY_ID: (id: number) => `/NotificacionIntento/GetById?id=${id}` as const,
    CREATE: '/NotificacionIntento',
  },

  // Acciones Especiales de Reservas
  RESERVA_ACCIONES: {
    CHECK_IN: (id: number) => `/Reserva/${id}/CheckIn` as const,
  },

  // Acciones Especiales de Amenities
  AMENITY_ACCIONES: {
    DISPONIBILIDAD: (id: number, fecha: string) => `/Amenity/${id}/Disponibilidad?fecha=${fecha}` as const,
    FUERA_DE_SERVICIO: (id: number) => `/Amenity/${id}/FueraDeServicio` as const,
  },
} as const;
