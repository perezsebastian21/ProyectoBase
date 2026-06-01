import { apiClient } from '@/lib/api-client';

export interface HealthResponse {
  status?: string;
  alive?: boolean;
  message?: string;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Servicio para consultar el estado de salud del backend.
 */
export const healthService = {
  /**
   * Realiza la llamada al endpoint /health/alive.
   * Admite opciones adicionales de aborto (AbortSignal) si es necesario.
   */
  async checkHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return apiClient<HealthResponse>('/health/alive', {
      method: 'GET',
      signal,
      // Para evitar cache persistente en Next.js
      cache: 'no-store',
    });
  },
};
