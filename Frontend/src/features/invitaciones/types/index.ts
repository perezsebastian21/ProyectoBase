import { UserRole } from '@/types/roles';

export type EstadoInvitacion = 'PENDIENTE' | 'ACEPTADA' | 'EXPIRADA' | 'REVOCADA';

export type EstadoRelacionUnidad = 'PENDIENTE_APROBACION_ADMIN' | 'VIGENTE' | 'RECHAZADA' | 'FINALIZADA';

export type TipoRelacionUnidad = 'PROPIETARIO' | 'INQUILINO';

export interface InvitacionUsuario {
  idInvitacion: number;
  idConsorcio: number;
  nombreConsorcio?: string;
  idComplejo?: number | null;
  nombreComplejo?: string | null;
  idUnidadHabitacional?: number | null;
  identificadorUnidad?: string | null;
  emailDestino: string;
  telefonoDestino?: string | null;
  token: string;
  rolDestino: UserRole;
  estado: EstadoInvitacion;
  fechaCreacion: string;
  fechaExpiracion: string;
  fechaAceptacion?: string | null;
  idUsuarioCreador?: number | null;
}

export interface InvitacionValidadaDto {
  token: string;
  valida: boolean;
  esExpirada: boolean;
  rolDestino: UserRole;
  emailDestino: string;
  idConsorcio: number;
  nombreConsorcio: string;
  idComplejo?: number | null;
  nombreComplejo?: string | null;
  idUnidadHabitacional?: number | null;
  identificadorUnidad?: string | null;
  unidadesDisponibles?: Array<{
    idUnidadHabitacional: number;
    identificador: string;
    torreBloque?: string;
  }>;
}

export interface CrearInvitacionAdminDto {
  emailDestino: string;
  telefonoDestino?: string;
  nombre?: string;
  apellido?: string;
  razonSocial?: string;
}

export interface CrearInvitacionesMasivasDto {
  idConsorcio: number;
  idComplejo?: number;
  unidades?: Array<{
    idUnidadHabitacional?: number;
    identificador: string;
    emailDestino: string;
    telefonoDestino?: string;
  }>;
}

export interface CrearInvitacionInquilinoDto {
  idUnidadHabitacional: number;
  emailDestino: string;
  nombreDestino?: string;
  telefonoDestino?: string;
}

export interface AceptarInvitacionDto {
  token: string;
  esNuevoUsuario?: boolean;
  usuario?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  password?: string;
  idUnidadHabitacional: number;
  esOcupanteActual: boolean;
}

export interface UsuarioUnidadPendienteDto {
  idUsuarioUnidad: number;
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  dni?: string;
  telefono?: string;
  idConsorcio: number;
  nombreConsorcio: string;
  idUnidadHabitacional: number;
  identificadorUnidad: string;
  tipoRelacion: TipoRelacionUnidad;
  esOcupanteActual: boolean;
  estadoRelacion: EstadoRelacionUnidad;
  fechaSolicitud: string;
}
