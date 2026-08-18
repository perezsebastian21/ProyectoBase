import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ServiceResponse } from '@/types';
import type { UsuarioUnidadPendienteDto } from '@/features/invitaciones/types';

export const usuarioUnidadService = {
  /** Obtener lista de solicitudes de vinculación de propietario pendientes de aprobación (GET /api/usuario-unidad/pendientes) */
  async obtenerPendientes(): Promise<ServiceResponse<UsuarioUnidadPendienteDto[]>> {
    return apiClient<ServiceResponse<UsuarioUnidadPendienteDto[]>>(API_ENDPOINTS.USUARIO_UNIDAD.PENDIENTES, {
      method: 'GET',
    });
  },

  /** Aprobar vinculación de propietario para otorgarle acceso pleno (POST /api/usuario-unidad/{id}/aprobar) */
  async aprobarVinculacion(idUsuarioUnidad: number): Promise<ServiceResponse<{ mensaje: string }>> {
    return apiClient<ServiceResponse<{ mensaje: string }>>(API_ENDPOINTS.USUARIO_UNIDAD.APROBAR(idUsuarioUnidad), {
      method: 'POST',
    });
  },

  /** Rechazar vinculación de propietario especificando motivo (POST /api/usuario-unidad/{id}/rechazar) */
  async rechazarVinculacion(idUsuarioUnidad: number, motivo?: string): Promise<ServiceResponse<{ mensaje: string }>> {
    return apiClient<ServiceResponse<{ mensaje: string }>>(API_ENDPOINTS.USUARIO_UNIDAD.RECHAZAR(idUsuarioUnidad), {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    });
  },
};
