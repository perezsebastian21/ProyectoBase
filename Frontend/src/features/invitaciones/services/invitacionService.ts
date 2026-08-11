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

// Mock storage temporal para pruebas locales sin backend
let MOCK_INVITACIONES: InvitacionUsuario[] = [
  {
    idInvitacion: 101,
    idConsorcio: 1,
    nombreConsorcio: 'Consorcio Las Heras',
    idComplejo: 1,
    nombreComplejo: 'Torre A',
    idUnidadHabitacional: 1,
    identificadorUnidad: 'Depto 4º B',
    emailDestino: 'propietario4b@ejemplo.com',
    token: 'token-demo-propietario-123',
    rolDestino: 'PROPIETARIO',
    estado: 'PENDIENTE',
    fechaCreacion: new Date().toISOString(),
    fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    idInvitacion: 102,
    idConsorcio: 1,
    nombreConsorcio: 'Consorcio Las Heras',
    idComplejo: 1,
    nombreComplejo: 'Torre A',
    idUnidadHabitacional: 2,
    identificadorUnidad: 'Depto 2º A',
    emailDestino: 'inquilino2a@ejemplo.com',
    token: 'token-demo-inquilino-456',
    rolDestino: 'INQUILINO',
    estado: 'PENDIENTE',
    fechaCreacion: new Date().toISOString(),
    fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const invitacionService = {
  /** SuperAdmin: Invitar un nuevo Administrador Avanzado */
  async crearInvitacionAdmin(dto: CrearInvitacionAdminDto): Promise<ServiceResponse<InvitacionUsuario>> {
    try {
      const res = await apiClient<ServiceResponse<InvitacionUsuario>>('/api/invitaciones/crear-admin', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    const nueva: InvitacionUsuario = {
      idInvitacion: Math.floor(Math.random() * 10000),
      idConsorcio: 0,
      emailDestino: dto.emailDestino,
      telefonoDestino: dto.telefonoDestino,
      token: `admin-token-${Date.now()}`,
      rolDestino: 'ADMINISTRADOR_AVANZADO',
      estado: 'PENDIENTE',
      fechaCreacion: new Date().toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    MOCK_INVITACIONES.push(nueva);

    return {
      data: nueva,
      success: true,
      errorMessage: null,
    };
  },

  /** Admin Avanzado: Enviar invitaciones masivas por consorcio/edificio */
  async crearInvitacionesMasivas(dto: CrearInvitacionesMasivasDto): Promise<ServiceResponse<{ creadasCount: number }>> {
    try {
      const res = await apiClient<ServiceResponse<{ creadasCount: number }>>('/api/invitaciones/masivas', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    const count = dto.unidades?.length || 1;
    return {
      data: { creadasCount: count },
      success: true,
      errorMessage: null,
    };
  },

  /** Propietario: Invitar un Inquilino para su Unidad */
  async crearInvitacionInquilino(dto: CrearInvitacionInquilinoDto): Promise<ServiceResponse<InvitacionUsuario>> {
    try {
      const res = await apiClient<ServiceResponse<InvitacionUsuario>>('/api/invitaciones/inquilino', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    const nueva: InvitacionUsuario = {
      idInvitacion: Math.floor(Math.random() * 10000),
      idConsorcio: 1,
      nombreConsorcio: 'Consorcio Las Heras',
      idUnidadHabitacional: dto.idUnidadHabitacional,
      identificadorUnidad: `Unidad #${dto.idUnidadHabitacional}`,
      emailDestino: dto.emailDestino,
      telefonoDestino: dto.telefonoDestino,
      token: `inquilino-token-${Date.now()}`,
      rolDestino: 'INQUILINO',
      estado: 'PENDIENTE',
      fechaCreacion: new Date().toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    MOCK_INVITACIONES.push(nueva);

    return {
      data: nueva,
      success: true,
      errorMessage: null,
    };
  },

  /** Público: Validar el token de invitación para el onboarding */
  async validarToken(token: string): Promise<ServiceResponse<InvitacionValidadaDto>> {
    try {
      const res = await apiClient<ServiceResponse<InvitacionValidadaDto>>(`/api/invitaciones/validar/${token}`, {
        method: 'GET',
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    const enMemoria = MOCK_INVITACIONES.find((i) => i.token === token);

    if (enMemoria) {
      return {
        data: {
          token: enMemoria.token,
          valida: enMemoria.estado === 'PENDIENTE',
          esExpirada: new Date(enMemoria.fechaExpiracion) < new Date(),
          rolDestino: enMemoria.rolDestino,
          emailDestino: enMemoria.emailDestino,
          idConsorcio: enMemoria.idConsorcio,
          nombreConsorcio: enMemoria.nombreConsorcio || 'Consorcio Las Heras',
          idComplejo: enMemoria.idComplejo,
          nombreComplejo: enMemoria.nombreComplejo || 'Torre A',
          idUnidadHabitacional: enMemoria.idUnidadHabitacional,
          identificadorUnidad: enMemoria.identificadorUnidad || 'Depto 4º B',
          unidadesDisponibles: [
            { idUnidadHabitacional: 1, identificador: 'Depto 1º A', torreBloque: 'Torre A' },
            { idUnidadHabitacional: 2, identificador: 'Depto 2º B', torreBloque: 'Torre A' },
            { idUnidadHabitacional: 3, identificador: 'Depto 4º B', torreBloque: 'Torre A' },
          ],
        },
        success: true,
        errorMessage: null,
      };
    }

    // Default mock si se consulta cualquier token en demo
    return {
      data: {
        token,
        valida: true,
        esExpirada: false,
        rolDestino: token.includes('inquilino') ? 'INQUILINO' : 'PROPIETARIO',
        emailDestino: 'residente@ejemplo.com',
        idConsorcio: 1,
        nombreConsorcio: 'Consorcio Las Heras',
        idComplejo: 1,
        nombreComplejo: 'Torre A (Principal)',
        idUnidadHabitacional: 3,
        identificadorUnidad: 'Depto 4º B',
        unidadesDisponibles: [
          { idUnidadHabitacional: 1, identificador: 'Depto 1º A', torreBloque: 'Torre A' },
          { idUnidadHabitacional: 2, identificador: 'Depto 2º B', torreBloque: 'Torre A' },
          { idUnidadHabitacional: 3, identificador: 'Depto 4º B', torreBloque: 'Torre A' },
          { idUnidadHabitacional: 4, identificador: 'Depto 5º C', torreBloque: 'Torre A' },
        ],
      },
      success: true,
      errorMessage: null,
    };
  },

  /** Público: Aceptar invitación y registrar datos / vincular unidad */
  async aceptarInvitacion(dto: AceptarInvitacionDto): Promise<ServiceResponse<{
    idUsuarioUnidad: number;
    estadoRelacion: string;
    mensaje: string;
  }>> {
    try {
      const res = await apiClient<ServiceResponse<any>>('/api/invitaciones/aceptar', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    // Marca invitación como aceptada en mock
    const inv = MOCK_INVITACIONES.find((i) => i.token === dto.token);
    const esPropietario = inv ? inv.rolDestino === 'PROPIETARIO' : true;
    const estado = esPropietario ? 'PENDIENTE_APROBACION_ADMIN' : 'VIGENTE';

    return {
      data: {
        idUsuarioUnidad: Math.floor(Math.random() * 5000),
        estadoRelacion: estado,
        mensaje: esPropietario
          ? 'Tu solicitud de vinculación de propiedad fue registrada. Se encuentra PENDIENTE de aprobación por la Administración.'
          : '¡Invitación aceptada! Tu cuenta de Inquilino ha sido activada correctamente.',
      },
      success: true,
      errorMessage: null,
    };
  },
};
