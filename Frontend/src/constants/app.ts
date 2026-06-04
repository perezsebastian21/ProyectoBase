/**
 * Application Configuration Constants
 *
 * Configuración general de la aplicación.
 *
 * Uso:
 *   import { APP_CONFIG } from '@/constants';
 */

export const APP_CONFIG = {
  /** Nombre de la aplicación */
  NAME: 'Amenities',

  /** Descripción corta */
  DESCRIPTION: 'Sistema de gestión de amenities para edificios',

  /** Versión actual */
  VERSION: '0.1.0',

  /** Cantidad de items por página por defecto */
  DEFAULT_PAGE_SIZE: 10,

  /** Tiempo de timeout para requests API (en ms) */
  API_TIMEOUT: 10000,

  /** Tiempo de polling para health check (en ms) */
  HEALTH_CHECK_INTERVAL: 30000,
} as const;
