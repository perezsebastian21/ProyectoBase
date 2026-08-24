import { apiClient } from '@/lib/api-client';
import type { ServiceResponse, UnidadHabitacional, Reserva } from '@/types';

export interface UnidadPropietarioResumen {
  unidad: UnidadHabitacional;
  reservasActivas: Reserva[];
  incidenciasAbiertasCount: number;
  requiereAprobacionCount: number;
}

export const propietarioService = {
  /** Obtener todas las unidades vinculadas al Propietario (BR-AUTH-010) */
  async getMisUnidades(): Promise<ServiceResponse<UnidadPropietarioResumen[]>> {
    return apiClient<ServiceResponse<UnidadPropietarioResumen[]>>('/Propietario/MisUnidades', {
      method: 'GET',
    });
  },

  /** Aprobar reserva del inquilino cuando la unidad lo requiere (BR-AUTH-013) */
  async aprobarReservaInquilino(idReserva: number): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>(`/Reserva/${idReserva}/AprobarPropietario`, {
      method: 'POST',
    });
  },
};
