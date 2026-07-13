import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';
import type {
  Persona,
  CreatePersonaPayload,
  UpdatePersonaPayload
} from '../types';

export const personaService = {
  async getAll(): Promise<ApiResponse<Persona[]>> {
    return apiClient<ApiResponse<Persona[]>>(API_ENDPOINTS.PERSONA.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ApiResponse<Persona>> {
    return apiClient<ApiResponse<Persona>>(API_ENDPOINTS.PERSONA.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<ApiResponse<{ items: Persona[]; totalCount: number }>> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.PERSONA.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: Persona[] = [];
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

  async create(payload: CreatePersonaPayload): Promise<ApiResponse<Persona>> {
    return apiClient<ApiResponse<Persona>>(API_ENDPOINTS.PERSONA.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: UpdatePersonaPayload): Promise<ApiResponse<Persona>> {
    return apiClient<ApiResponse<Persona>>(API_ENDPOINTS.PERSONA.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.PERSONA.DELETE(id), {
      method: 'DELETE',
    });
  },
};
