import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ServiceResponse, UnidadHabitacional } from '@/types';
import type {
  CreateUnidadPayload,
  UpdateUnidadPayload
} from '../types';

export interface SancionPayload {
  idUnidadHabitacional: number;
  descripcion: string;
  aplicarSuspension: boolean;
  duracionDias: number;
}

export const unidadService = {
  async getAll(): Promise<ServiceResponse<UnidadHabitacional[]>> {
    return apiClient<ServiceResponse<UnidadHabitacional[]>>(API_ENDPOINTS.UNIDAD_HABITACIONAL.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ServiceResponse<UnidadHabitacional>> {
    return apiClient<ServiceResponse<UnidadHabitacional>>(API_ENDPOINTS.UNIDAD_HABITACIONAL.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async sancionar(payload: SancionPayload): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>('/UnidadHabitacional/Sancionar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<{ success: boolean; errorMessage: string | null; data: { items: UnidadHabitacional[]; totalCount: number } }> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.UNIDAD_HABITACIONAL.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: UnidadHabitacional[] = [];
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

  async create(payload: CreateUnidadPayload): Promise<ServiceResponse<UnidadHabitacional>> {
    return apiClient<ServiceResponse<UnidadHabitacional>>(API_ENDPOINTS.UNIDAD_HABITACIONAL.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: UpdateUnidadPayload): Promise<ServiceResponse<UnidadHabitacional>> {
    return apiClient<ServiceResponse<UnidadHabitacional>>(API_ENDPOINTS.UNIDAD_HABITACIONAL.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ServiceResponse<boolean>> {
    return apiClient<ServiceResponse<boolean>>(API_ENDPOINTS.UNIDAD_HABITACIONAL.DELETE(id), {
      method: 'DELETE',
    });
  },
};
