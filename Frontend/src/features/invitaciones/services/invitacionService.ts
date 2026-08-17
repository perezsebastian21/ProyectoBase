import { apiClient } from '@/lib/api-client';
import type { ServiceResponse } from '@/types';
import type {
  InvitacionUsuario,
  InvitacionValidadaDto,
  CrearInvitacionAdminDto,
  CrearInvitacionesMasivasDto,
  CrearInvitacionInquilinoDto,
  AceptarInvitacionDto,
} from '../types';

export const invitacionService = {
  /** SuperAdmin: Invitar un nuevo Administrador Avanzado */
  async crearInvitacionAdmin(dto: CrearInvitacionAdminDto): Promise<ServiceResponse<InvitacionUsuario>> {
    return apiClient<ServiceResponse<InvitacionUsuario>>('/api/invitaciones/crear-admin', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /** Admin Avanzado: Enviar invitaciones masivas por consorcio/edificio */
  async crearInvitacionesMasivas(dto: CrearInvitacionesMasivasDto): Promise<ServiceResponse<{ creadasCount: number }>> {
    return apiClient<ServiceResponse<{ creadasCount: number }>>('/api/invitaciones/masivas', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /** Propietario: Invitar un Inquilino para su Unidad */
  async crearInvitacionInquilino(dto: CrearInvitacionInquilinoDto): Promise<ServiceResponse<InvitacionUsuario>> {
    return apiClient<ServiceResponse<InvitacionUsuario>>('/api/invitaciones/inquilino', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /** Público: Validar el token de invitación para el onboarding */
  async validarToken(token: string): Promise<ServiceResponse<InvitacionValidadaDto>> {
    return apiClient<ServiceResponse<InvitacionValidadaDto>>(`/api/invitaciones/validar/${token}`, {
      method: 'GET',
    });
  },

  /** Público: Aceptar invitación y registrar datos / vincular unidad */
  async aceptarInvitacion(dto: AceptarInvitacionDto): Promise<ServiceResponse<{
    idUsuarioUnidad: number;
    estadoRelacion: string;
    mensaje: string;
  }>> {
    return apiClient<ServiceResponse<any>>('/api/invitaciones/aceptar', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
