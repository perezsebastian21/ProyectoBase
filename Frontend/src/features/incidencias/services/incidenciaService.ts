import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';
import type {
  Incidencia,
  CreateIncidenciaPayload,
  UpdateIncidenciaPayload
} from '../types';

export const incidenciaService = {
  async getAll(): Promise<ApiResponse<Incidencia[]>> {
    return apiClient<ApiResponse<Incidencia[]>>(API_ENDPOINTS.INCIDENCIA.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ApiResponse<Incidencia>> {
    return apiClient<ApiResponse<Incidencia>>(API_ENDPOINTS.INCIDENCIA.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<ApiResponse<{ items: Incidencia[]; totalCount: number }>> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.INCIDENCIA.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: Incidencia[] = [];
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

  async create(payload: CreateIncidenciaPayload): Promise<ApiResponse<Incidencia>> {
    return apiClient<ApiResponse<Incidencia>>(API_ENDPOINTS.INCIDENCIA.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: UpdateIncidenciaPayload): Promise<ApiResponse<Incidencia>> {
    return apiClient<ApiResponse<Incidencia>>(API_ENDPOINTS.INCIDENCIA.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.INCIDENCIA.DELETE(id), {
      method: 'DELETE',
    });
  },
};
