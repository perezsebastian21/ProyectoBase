const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyectobase-i6yv.onrender.com';

/**
 * Clase de error personalizada para manejar respuestas de API no exitosas.
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(status: number, statusText: string, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Cliente de API genérico que maneja peticiones fetch con cabeceras por defecto
 * y control detallado de errores HTTP.
 * 
 * @param endpoint Ruta del endpoint, ej: '/health/alive' o 'health/alive'
 * @param options Opciones adicionales para el fetch (headers, method, body, etc.)
 * @returns Promesa con los datos tipados de la respuesta.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Asegurar que no duplicamos barras inclinadas
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BACKEND_URL}${cleanEndpoint}`;

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  // Obtener token de la cookie si estamos en el cliente
  let token: string | undefined;
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
    token = match ? match[2] : undefined;
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Si es 204 (No Content), resolvemos como vacío
    if (response.status === 204) {
      return {} as T;
    }

    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = typeof data === 'string'
        ? data
        : (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string')
          ? (data as { message: string }).message
          : 'Error en la petición API';

      throw new ApiError(
        response.status,
        response.statusText,
        errorMsg,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Capturar errores de red u otros fallos de fetch
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión con el servidor';
    throw new ApiError(0, 'Network Error', errorMessage);
  }
}
