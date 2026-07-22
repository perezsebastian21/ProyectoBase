/**
 * Context Providers
 *
 * React Context providers para estado global de la aplicación.
 * Cada provider maneja un dominio específico de estado.
 *
 * Uso:
 *   import { AuthProvider, ThemeProvider } from '@/components/providers';
 */

// export { AuthProvider } from './AuthProvider';
// export { ThemeProvider } from './ThemeProvider';
export { ConsorcioProvider, useConsorcioActivo } from './ConsorcioContext';
export type { ConsorcioActivo, ComplejoActivo } from './ConsorcioContext';
