import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';
import type {
  ListaEspera,
  CreateListaEsperaPayload,
  UpdateListaEsperaPayload
} from '../types';

export const listaEsperaService = {
  async getAll(): Promise<ApiResponse<ListaEspera[]>> {
    return apiClient<ApiResponse<ListaEspera[]>>(API_ENDPOINTS.LISTA_ESPERA.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ApiResponse<ListaEspera>> {
    return apiClient<ApiResponse<ListaEspera>>(API_ENDPOINTS.LISTA_ESPERA.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<ApiResponse<{ items: ListaEspera[]; totalCount: number }>> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.LISTA_ESPERA.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: ListaEspera[] = [];
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

  async create(payload: CreateListaEsperaPayload): Promise<ApiResponse<ListaEspera>> {
    return apiClient<ApiResponse<ListaEspera>>(API_ENDPOINTS.LISTA_ESPERA.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: UpdateListaEsperaPayload): Promise<ApiResponse<ListaEspera>> {
    return apiClient<ApiResponse<ListaEspera>>(API_ENDPOINTS.LISTA_ESPERA.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.LISTA_ESPERA.DELETE(id), {
      method: 'DELETE',
    });
  },
};
