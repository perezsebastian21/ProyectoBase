import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ServiceResponse, DisponibilidadResponseDto } from '@/types';
import type {
  Amenity,
  CreateAmenityPayload,
  UpdateAmenityPayload
} from '../types';

export interface CancelacionMasivaPayload {
  idAmenity: number;
  fechaDesde: string;
  fechaHasta?: string;
  motivoAdmin: string;
  cancelarReservasAfectadas: boolean;
}

export const amenityService = {
  async getAll(): Promise<ServiceResponse<Amenity[]>> {
    return apiClient<ServiceResponse<Amenity[]>>(API_ENDPOINTS.AMENITY.GET_ALL, {
      method: 'GET',
    });
  },

  async getById(id: number): Promise<ServiceResponse<Amenity>> {
    return apiClient<ServiceResponse<Amenity>>(API_ENDPOINTS.AMENITY.GET_BY_ID(id), {
      method: 'GET',
    });
  },

  async getDisponibilidad(
    idAmenity: number,
    fechaDesde: string,
    fechaHasta?: string,
    idUnidadHabitacional?: number
  ): Promise<ServiceResponse<DisponibilidadResponseDto>> {
    const params = new URLSearchParams({
      fechaDesde,
    });
    if (fechaHasta) params.append('fechaHasta', fechaHasta);
    if (idUnidadHabitacional) params.append('idUnidadHabitacional', idUnidadHabitacional.toString());

    return apiClient<ServiceResponse<DisponibilidadResponseDto>>(
      `/Amenity/${idAmenity}/Disponibilidad?${params.toString()}`,
      { method: 'GET' }
    );
  },

  async cancelacionMasiva(
    idAmenity: number,
    payload: CancelacionMasivaPayload
  ): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>(`/Amenity/${idAmenity}/FueraDeServicio`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async findQP(
    page: number,
    limit: number,
    search: string = ''
  ): Promise<{ success: boolean; errorMessage: string | null; data: { items: Amenity[]; totalCount: number } }> {
    const queryParams = new URLSearchParams({
      Page: page.toString(),
      Limit: limit.toString(),
    });

    if (search.trim()) {
      queryParams.append('Search', search.trim());
    }

    const endpoint = `${API_ENDPOINTS.AMENITY.FIND_QP}?${queryParams.toString()}`;

    const response = await apiClient<any>(endpoint, {
      method: 'GET',
    });

    let items: Amenity[] = [];
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

  async create(payload: CreateAmenityPayload): Promise<ServiceResponse<Amenity>> {
    return apiClient<ServiceResponse<Amenity>>(API_ENDPOINTS.AMENITY.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(payload: UpdateAmenityPayload): Promise<ServiceResponse<Amenity>> {
    return apiClient<ServiceResponse<Amenity>>(API_ENDPOINTS.AMENITY.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<ServiceResponse<boolean>> {
    return apiClient<ServiceResponse<boolean>>(API_ENDPOINTS.AMENITY.DELETE(id), {
      method: 'DELETE',
    });
  },
};
