/**
 * Auth Types & Interfaces
 */

/** Payload para el endpoint POST /account/login */
export interface LoginRequest {
  usuario: string;
  password: string;
}

/** Respuesta del endpoint de login */
export interface LoginResponse {
  data: {
    token: string;
    expiration: string;
  };
  success: boolean;
  errorMessage: string | null;
}

/** Estado del formulario de login */
export interface LoginFormState {
  usuario: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
}
