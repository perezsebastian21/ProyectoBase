import { apiClient } from '@/lib/api-client';
import type { ServiceResponse, AccesoResultadoDto } from '@/types';

export interface AccesoConsultaPayload {
  dni: string;
}

export interface EgresoPayload {
  idInvitado: number;
}

export interface CheckInPayload {
  idReserva: number;
}

export const accesoService = {
  /** Consultar si un visitante está autorizado por DNI */
  async consultarDni(dni: string): Promise<ServiceResponse<AccesoResultadoDto>> {
    return apiClient<ServiceResponse<AccesoResultadoDto>>('/Acceso/Consultar', {
      method: 'POST',
      body: JSON.stringify({ dni }),
    });
  },

  /** Registrar el ingreso efectivo de un invitado autorizado */
  async registrarIngreso(idInvitado: number): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>('/Acceso/RegistrarIngreso', {
      method: 'POST',
      body: JSON.stringify({ idInvitado }),
    });
  },

  /** Registrar el egreso del invitado (RN-29) */
  async registrarEgreso(idInvitado: number): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>('/Acceso/RegistrarEgreso', {
      method: 'POST',
      body: JSON.stringify({ idInvitado }),
    });
  },

  /** Registrar Check-in de presencia en reserva de amenity (CU-01) */
  async registrarCheckInReserva(idReserva: number): Promise<ServiceResponse<any>> {
    return apiClient<ServiceResponse<any>>(`/Reserva/${idReserva}/CheckIn`, {
      method: 'POST',
    });
  },
};
