import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';
import type {
  Complejo,
  CreateComplejoPayload,
  UpdateComplejoPayload
} from '../types';

/**
 * Servicio para gestionar la comunicación con los endpoints de Complejo.
 */
export const complejoService = {
  /**
   * Obtiene todos los complejos (lista completa).
   */
  async getAll(): Promise<ApiResponse<Complejo[]>> {
    return apiClient<ApiResponse<Complejo[]>>(API_ENDPOINTS.COMPLEJO.GET_ALL, {
      method: 'GET',
    });
  },

  /**
   * Obtiene un complejo por su ID.
   */
  async getById(id: number): Promise<ApiResponse<Complejo>> {
    return apiClient<ApiResponse<Complejo>>(API_ENDPOINTS.COMPLEJO.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  /**
   * Realiza la búsqueda paginada y filtrada de complejos.
   * Normalizamos la respuesta en caso de variaciones en la estructura.
   */
  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<ApiResponse<{ items: Complejo[]; totalCount: number }>> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.COMPLEJO.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: Complejo[] = [];
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
   * Crea un nuevo complejo.
   */
  async create(payload: CreateComplejoPayload): Promise<ApiResponse<Complejo>> {
    return apiClient<ApiResponse<Complejo>>(API_ENDPOINTS.COMPLEJO.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Modifica un complejo existente.
   */
  async update(payload: UpdateComplejoPayload): Promise<ApiResponse<Complejo>> {
    return apiClient<ApiResponse<Complejo>>(API_ENDPOINTS.COMPLEJO.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina un complejo por su ID.
   */
  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.COMPLEJO.DELETE(id), {
      method: 'DELETE',
    });
  },
};
