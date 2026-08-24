import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ServiceResponse } from '@/types';
import type {
  Inquilino,
  CreateInquilinoPayload,
  UpdateInquilinoPayload
} from '../types';

export const inquilinoService = {
  async getAll(): Promise<ServiceResponse<Inquilino[]>> {
    return apiClient<ServiceResponse<Inquilino[]>>(API_ENDPOINTS.INQUILINO.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ServiceResponse<Inquilino>> {
    return apiClient<ServiceResponse<Inquilino>>(API_ENDPOINTS.INQUILINO.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async darDeBaja(idInquilino: number): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>('/Inquilino/DarDeBaja', {
      method: 'POST',
      body: JSON.stringify({ idInquilino }),
    });
  },

  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<{ success: boolean; errorMessage: string | null; data: { items: Inquilino[]; totalCount: number } }> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.INQUILINO.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: Inquilino[] = [];
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

  async create(payload: CreateInquilinoPayload): Promise<ServiceResponse<Inquilino>> {
    return apiClient<ServiceResponse<Inquilino>>(API_ENDPOINTS.INQUILINO.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: UpdateInquilinoPayload): Promise<ServiceResponse<Inquilino>> {
    return apiClient<ServiceResponse<Inquilino>>(API_ENDPOINTS.INQUILINO.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ServiceResponse<boolean>> {
    return apiClient<ServiceResponse<boolean>>(API_ENDPOINTS.INQUILINO.DELETE(id), {
      method: 'DELETE',
    });
  },
};
