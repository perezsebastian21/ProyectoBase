/**
 * Global Type Definitions
 *
 * Tipos compartidos entre múltiples features de la aplicación.
 * Los tipos específicos de cada feature van en features/[feature]/types/
 *
 * Uso:
 *   import type { ApiResponse, PaginatedResponse, User } from '@/types';
 */

// ============================================================
// API Response Types
// ============================================================

/** Respuesta genérica de la API */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Respuesta paginada de la API */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Error de la API */
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ============================================================
// User Types
// ============================================================

/** Roles de usuario en la aplicación */
export type UserRole = 'superadmin' | 'admin' | 'resident' | 'security' | 'maintenance';

/** Información del usuario autenticado */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  unit?: string;
  building?: string;
}

// ============================================================
// Common Types
// ============================================================

/** Estado genérico para entidades */
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'archived';

/** Timestamps comunes en entidades */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/** Parámetros de paginación para requests */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
