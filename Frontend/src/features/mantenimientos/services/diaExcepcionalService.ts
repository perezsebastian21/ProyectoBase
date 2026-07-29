import { apiClient } from '@/lib/api-client';
import type { ServiceResponse } from '@/types';

export interface DiaExcepcional {
  idDiaExcepcional: number;
  idAmenity?: number | null;
  nombreAmenity?: string;
  fecha: string;
  tipo: 'FERIADO_CIERRA' | 'APERTURA_EXTRAORDINARIA';
  nota?: string;
}

export interface CreateDiaExcepcionalPayload {
  idAmenity?: number | null;
  fecha: string;
  tipo: 'FERIADO_CIERRA' | 'APERTURA_EXTRAORDINARIA';
  nota?: string;
}

export const diaExcepcionalService = {
  async getAll(): Promise<ServiceResponse<DiaExcepcional[]>> {
    return apiClient<ServiceResponse<DiaExcepcional[]>>('/DiaExcepcional', {
      method: 'GET',
    });
  },

  async create(payload: CreateDiaExcepcionalPayload): Promise<ServiceResponse<DiaExcepcional>> {
    return apiClient<ServiceResponse<DiaExcepcional>>('/DiaExcepcional', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ServiceResponse<boolean>> {
    return apiClient<ServiceResponse<boolean>>(`/DiaExcepcional/${id}`, {
      method: 'DELETE',
    });
  },
};
