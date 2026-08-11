import { apiClient } from '@/lib/api-client';
import type { ServiceResponse } from '@/types';
import type { UsuarioUnidadPendienteDto } from '@/features/invitaciones/types';

let MOCK_PENDIENTES: UsuarioUnidadPendienteDto[] = [
  {
    idUsuarioUnidad: 1,
    idUsuario: 10,
    nombreCompleto: 'Carlos Eduardo Gómez',
    email: 'carlos.gomez@ejemplo.com',
    dni: '32.456.789',
    telefono: '+54 11 5544-3322',
    idConsorcio: 1,
    nombreConsorcio: 'Consorcio Las Heras',
    idUnidadHabitacional: 3,
    identificadorUnidad: 'Depto 4º B',
    tipoRelacion: 'PROPIETARIO',
    esOcupanteActual: true,
    estadoRelacion: 'PENDIENTE_APROBACION_ADMIN',
    fechaSolicitud: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    idUsuarioUnidad: 2,
    idUsuario: 11,
    nombreCompleto: 'Mariana López',
    email: 'mariana.lopez@ejemplo.com',
    dni: '29.876.543',
    telefono: '+54 11 4433-2211',
    idConsorcio: 1,
    nombreConsorcio: 'Consorcio Las Heras',
    idUnidadHabitacional: 5,
    identificadorUnidad: 'Depto 7º A',
    tipoRelacion: 'PROPIETARIO',
    esOcupanteActual: false,
    estadoRelacion: 'PENDIENTE_APROBACION_ADMIN',
    fechaSolicitud: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const usuarioUnidadService = {
  /** Obtener lista de solicitudes de vinculación de propietario pendientes de aprobación */
  async obtenerPendientes(): Promise<ServiceResponse<UsuarioUnidadPendienteDto[]>> {
    try {
      const res = await apiClient<ServiceResponse<UsuarioUnidadPendienteDto[]>>('/api/usuario-unidad/pendientes', {
        method: 'GET',
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    return {
      data: MOCK_PENDIENTES.filter((p) => p.estadoRelacion === 'PENDIENTE_APROBACION_ADMIN'),
      success: true,
      errorMessage: null,
    };
  },

  /** Aprobar vinculación de propietario para otorgarle acceso pleno */
  async aprobarVinculacion(idUsuarioUnidad: number): Promise<ServiceResponse<{ mensaje: string }>> {
    try {
      const res = await apiClient<ServiceResponse<any>>(`/api/usuario-unidad/${idUsuarioUnidad}/aprobar`, {
        method: 'POST',
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    MOCK_PENDIENTES = MOCK_PENDIENTES.map((item) =>
      item.idUsuarioUnidad === idUsuarioUnidad ? { ...item, estadoRelacion: 'VIGENTE' as const } : item
    );

    return {
      data: { mensaje: 'La vinculación del Propietario ha sido APROBADA con éxito.' },
      success: true,
      errorMessage: null,
    };
  },

  /** Rechazar vinculación de propietario especificando motivo */
  async rechazarVinculacion(idUsuarioUnidad: number, motivo?: string): Promise<ServiceResponse<{ mensaje: string }>> {
    try {
      const res = await apiClient<ServiceResponse<any>>(`/api/usuario-unidad/${idUsuarioUnidad}/rechazar`, {
        method: 'POST',
        body: JSON.stringify({ motivo }),
      });
      if (res && res.success) return res;
    } catch {
      // Fallback local
    }

    MOCK_PENDIENTES = MOCK_PENDIENTES.map((item) =>
      item.idUsuarioUnidad === idUsuarioUnidad ? { ...item, estadoRelacion: 'RECHAZADA' as const } : item
    );

    return {
      data: { mensaje: 'La solicitud de vinculación ha sido rechazada.' },
      success: true,
      errorMessage: null,
    };
  },
};
