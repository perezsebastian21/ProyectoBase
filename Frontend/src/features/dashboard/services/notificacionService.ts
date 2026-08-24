import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';

export interface NotificacionIntento {
  idIntento: number;
  idNotificacion: number;
  canal: 'PUSH' | 'EMAIL' | 'WHATSAPP' | 'SMS';
  enviadoEn: string;
  entregado: boolean;
  entregadoEn?: string;
}

export interface CreateNotificacionIntentoPayload {
  idNotificacion: number;
  canal: 'PUSH' | 'EMAIL' | 'WHATSAPP' | 'SMS';
  enviadoEn: string;
  entregado: boolean;
  entregadoEn?: string;
}

export const notificacionService = {
  async getAll(): Promise<ApiResponse<NotificacionIntento[]>> {
    return apiClient<ApiResponse<NotificacionIntento[]>>(API_ENDPOINTS.NOTIFICACION_INTENTO.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ApiResponse<NotificacionIntento>> {
    return apiClient<ApiResponse<NotificacionIntento>>(API_ENDPOINTS.NOTIFICACION_INTENTO.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async create(payload: CreateNotificacionIntentoPayload): Promise<ApiResponse<NotificacionIntento>> {
    return apiClient<ApiResponse<NotificacionIntento>>(API_ENDPOINTS.NOTIFICACION_INTENTO.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
