import { apiClient } from '@/lib/api-client';
import type { ServiceResponse } from '@/types';
import type { UsuarioUnidadPendienteDto } from '@/features/invitaciones/types';

export const usuarioUnidadService = {
  /** Obtener lista de solicitudes de vinculación de propietario pendientes de aprobación */
  async obtenerPendientes(): Promise<ServiceResponse<UsuarioUnidadPendienteDto[]>> {
    return apiClient<ServiceResponse<UsuarioUnidadPendienteDto[]>>('/api/usuario-unidad/pendientes', {
      method: 'GET',
    });
  },

  /** Aprobar vinculación de propietario para otorgarle acceso pleno */
  async aprobarVinculacion(idUsuarioUnidad: number): Promise<ServiceResponse<{ mensaje: string }>> {
    return apiClient<ServiceResponse<{ mensaje: string }>>(`/api/usuario-unidad/${idUsuarioUnidad}/aprobar`, {
      method: 'POST',
    });
  },

  /** Rechazar vinculación de propietario especificando motivo */
  async rechazarVinculacion(idUsuarioUnidad: number, motivo?: string): Promise<ServiceResponse<{ mensaje: string }>> {
    return apiClient<ServiceResponse<{ mensaje: string }>>(`/api/usuario-unidad/${idUsuarioUnidad}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    });
  },
};
