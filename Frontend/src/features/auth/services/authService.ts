import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

/**
 * Auth Service
 *
 * Maneja todas las llamadas a la API relacionadas con autenticación.
 */
export const authService = {
  /**
   * Realiza el login enviando email y password via POST a /account/login.
   * Por ahora el backend siempre responde 200.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};
