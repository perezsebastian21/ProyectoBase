import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
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
  /** SuperAdmin: Invitar un nuevo Administrador Avanzado (POST /api/invitaciones/crear-admin) */
  async crearInvitacionAdmin(dto: CrearInvitacionAdminDto): Promise<ServiceResponse<InvitacionUsuario>> {
    return apiClient<ServiceResponse<InvitacionUsuario>>(API_ENDPOINTS.INVITACIONES.CREAR_ADMIN, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /** Admin Avanzado: Enviar invitaciones masivas por consorcio/edificio (POST /api/invitaciones/masivas) */
  async crearInvitacionesMasivas(dto: CrearInvitacionesMasivasDto): Promise<ServiceResponse<{ creadasCount: number }>> {
    return apiClient<ServiceResponse<{ creadasCount: number }>>(API_ENDPOINTS.INVITACIONES.MASIVAS, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /** Propietario: Invitar un Inquilino para su Unidad (POST /api/invitaciones/inquilino) */
  async crearInvitacionInquilino(dto: CrearInvitacionInquilinoDto): Promise<ServiceResponse<InvitacionUsuario>> {
    return apiClient<ServiceResponse<InvitacionUsuario>>(API_ENDPOINTS.INVITACIONES.INQUILINO, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /** Público: Validar el token de invitación para el onboarding (GET /api/invitaciones/validar/{token}) */
  async validarToken(token: string): Promise<ServiceResponse<InvitacionValidadaDto>> {
    return apiClient<ServiceResponse<InvitacionValidadaDto>>(API_ENDPOINTS.INVITACIONES.VALIDAR(token), {
      method: 'GET',
    });
  },

  /** Público: Aceptar invitación y registrar datos / vincular unidad (POST /api/invitaciones/aceptar) */
  async aceptarInvitacion(dto: AceptarInvitacionDto): Promise<ServiceResponse<{
    idUsuarioUnidad: number;
    estadoRelacion: string;
    mensaje: string;
  }>> {
    return apiClient<ServiceResponse<any>>(API_ENDPOINTS.INVITACIONES.ACEPTAR, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
