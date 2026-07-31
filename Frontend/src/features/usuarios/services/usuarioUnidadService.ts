import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

export interface UsuarioUnidad {
  idUsuarioUnidad: number;
  idUsuario: number;
  idUnidadHabitacional: number;
  tipoRelacion: 'PROPIETARIO' | 'INQUILINO';
  esOcupanteActual: boolean;
}

export interface CreateUsuarioUnidadPayload {
  idUsuario: number;
  idUnidadHabitacional: number;
  tipoRelacion: 'PROPIETARIO' | 'INQUILINO';
  esOcupanteActual?: boolean;
}

export const usuarioUnidadService = {
  async getAll(): Promise<ApiResponse<UsuarioUnidad[]>> {
    return apiClient<ApiResponse<UsuarioUnidad[]>>(API_ENDPOINTS.USUARIO_UNIDAD.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ApiResponse<UsuarioUnidad>> {
    return apiClient<ApiResponse<UsuarioUnidad>>(API_ENDPOINTS.USUARIO_UNIDAD.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async create(payload: CreateUsuarioUnidadPayload): Promise<ApiResponse<UsuarioUnidad>> {
    return apiClient<ApiResponse<UsuarioUnidad>>(API_ENDPOINTS.USUARIO_UNIDAD.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.USUARIO_UNIDAD.DELETE(id), {
      method: 'DELETE',
    });
  },
};
