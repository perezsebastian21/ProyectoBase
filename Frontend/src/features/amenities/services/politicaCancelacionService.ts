import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

export interface PoliticaCancelacionTramo {
  idTramo: number;
  idAmenityConfig?: number;
  horasAntesDesde: number;
  horasAntesHasta: number;
  porcentajePenalidad: number;
}

export interface CreatePoliticaCancelacionPayload {
  idAmenityConfig?: number;
  horasAntesDesde: number;
  horasAntesHasta: number;
  porcentajePenalidad: number;
}

export const politicaCancelacionService = {
  async getAll(): Promise<ApiResponse<PoliticaCancelacionTramo[]>> {
    return apiClient<ApiResponse<PoliticaCancelacionTramo[]>>(API_ENDPOINTS.POLITICA_CANCELACION.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ApiResponse<PoliticaCancelacionTramo>> {
    return apiClient<ApiResponse<PoliticaCancelacionTramo>>(API_ENDPOINTS.POLITICA_CANCELACION.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async create(payload: CreatePoliticaCancelacionPayload): Promise<ApiResponse<PoliticaCancelacionTramo>> {
    return apiClient<ApiResponse<PoliticaCancelacionTramo>>(API_ENDPOINTS.POLITICA_CANCELACION.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: PoliticaCancelacionTramo): Promise<ApiResponse<PoliticaCancelacionTramo>> {
    return apiClient<ApiResponse<PoliticaCancelacionTramo>>(API_ENDPOINTS.POLITICA_CANCELACION.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.POLITICA_CANCELACION.DELETE(id), {
      method: 'DELETE',
    });
  },
};
