import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';
import type {
  Consorcio,
  CreateConsorcioPayload,
  UpdateConsorcioPayload
} from '../types';

/**
 * Servicio para gestionar la comunicación con los endpoints de Consorcio.
 */
export const consorcioService = {
  /**
   * Obtiene todos los consorcios (lista completa).
   */
  async getAll(): Promise<ApiResponse<Consorcio[]>> {
    return apiClient<ApiResponse<Consorcio[]>>(API_ENDPOINTS.CONSORCIO.GET_ALL, {
      method: 'GET',
    });
  },

  /**
   * Obtiene un consorcio por su ID.
   */
  async getById(id: number): Promise<ApiResponse<Consorcio>> {
    return apiClient<ApiResponse<Consorcio>>(API_ENDPOINTS.CONSORCIO.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  /**
   * Realiza la búsqueda paginada y filtrada de consorcios.
   * Si la API devuelve los items estructurados o planos, normalizamos la respuesta.
   */
  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<ApiResponse<{ items: Consorcio[]; totalCount: number }>> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.CONSORCIO.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    // Normalizamos la respuesta por si el backend devuelve un listado directo o una estructura paginada
    let items: Consorcio[] = [];
    let totalCount = 0;

    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        items = response.data;
        totalCount = response.data.length;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        totalCount = response.data.totalCount ?? response.data.items.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        items = response.data.data;
        totalCount = response.data.total ?? response.data.data.length;
      } else {
        // Fallback en caso de que sea un objeto simple
        items = [response.data];
        totalCount = 1;
      }
    }

    return {
      success: response.success,
      errorMessage: response.errorMessage,
      data: {
        items,
        totalCount,
      },
    };
  },

  /**
   * Crea un nuevo consorcio.
   */
  async create(payload: CreateConsorcioPayload): Promise<ApiResponse<Consorcio>> {
    return apiClient<ApiResponse<Consorcio>>(API_ENDPOINTS.CONSORCIO.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Modifica un consorcio existente.
   */
  async update(payload: UpdateConsorcioPayload): Promise<ApiResponse<Consorcio>> {
    return apiClient<ApiResponse<Consorcio>>(API_ENDPOINTS.CONSORCIO.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina un consorcio por su ID.
   */
  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.CONSORCIO.DELETE(id), {
      method: 'DELETE',
    });
  },
};
