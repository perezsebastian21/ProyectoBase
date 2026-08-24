/**
 * Global Type Definitions — ProyectoBase Frontend
 * Alineado con specs-unificado.md
 */

// ============================================================
// API Response Envelopes (Clean N-Layer)
// ============================================================

/** Envelope estándar ServiceResponse<T> */
export interface ServiceResponse<T> {
  data: T | null;
  success: boolean;
  errorMessage: string | null;
}

/** Alias para compatibilidad hacia atrás */
export type ApiResponse<T> = ServiceResponse<T>;

/** PagedData<T> retornado dentro del ServiceResponse en endpoints paginados */
export interface PagedData<T> {
  data: T[];
  page: number;
  limit: number;
  totalRows: number;
  totalPage: number;
}

export type PagedResponse<T> = ServiceResponse<PagedData<T>>;

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  filter?: string;
  sortBy?: string;
  isAscending?: boolean;
  [key: string]: any;
}

// ============================================================
// Domain Entities & DTOs (specs-unificado.md)
// ============================================================

// ENT-01 · Consorcio
export interface Consorcio {
  idConsorcio: number;
  cuit: string;
  nombre: string;
  email: string;
  telefono?: string;
  timeZoneId: string;
  restringeReservasSimultaneas: boolean;
  tieneGuardiaDedicado: boolean;
}

// ENT-02 · Complejo
export interface Complejo {
  idComplejo: number;
  idConsorcio: number;
  nombre: string;
  tipo: 'EDIFICIO' | 'BARRIO_PRIVADO';
  direccion: string;
  consorcio?: Consorcio;
}

// ENT-03 · UnidadHabitacional
export interface UnidadHabitacional {
  idUnidadHabitacional: number;
  idComplejo: number;
  identificador: string;
  debeExpensas: boolean;
  saldoActual: number;
  estadoUnidad: 'ACTIVA' | 'SUSPENDIDA' | string;
  contadorInfracciones: number;
  contadorNoShow: number;
  contadorNoRespondioListaEspera: number;
  bloqueadaListaEsperaHasta?: string | null;
  requiereAprobacionPropietario: boolean;
  complejo?: Complejo;
}

// ENT-05 · AmenityConfig
export interface AmenityConfig {
  idAmenityConfig: number;
  idAmenity: number;
  horarioInicio: string;
  horarioFin: string;
  duracionBloqueMinutos: number;
  tiempoLimpiezaMinutos: number;
  tarifa: number;
  limiteReservasMesUnidad: number;
  requiereAprobacion: boolean;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  tiempoLimiteConfirmacionMinutos: number;
  maxPosicionesListaEsperaPorUnidad: number;
  permiteListaEsperaMismoDia: boolean;
}

// ENT-04 · Amenity
export interface Amenity {
  idAmenity: number;
  idComplejo: number;
  nombre: string;
  capacidad: number;
  estado: 'DISPONIBLE' | 'FUERA_DE_SERVICIO' | string;
  complejo?: Complejo;
  config?: AmenityConfig;
}

// ENT-08 · Reserva
export type EstadoReserva =
  | 'PENDIENTE_PAGO'
  | 'PENDIENTE_APROBACION'
  | 'PendienteAprobacionPropietario'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'EN_ESPERA'
  | 'NoAsistio'
  | string;

export interface Reserva {
  idReserva: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  fechaUso: string;
  horaInicio: string;
  horaFin: string;
  cantidadInvitados: number;
  estado: EstadoReserva;
  fechaSolicitud: string;
  checkInRealizado: boolean;
  checkInFecha?: string | null;
  montoRetenido: number;
  amenity?: Amenity;
  unidadHabitacional?: UnidadHabitacional;
}

export interface PoliticaCancelacionTramo {
  idTramo: number;
  idAmenityConfig?: number | null;
  horasAntesDesde: number;
  horasAntesHasta: number;
  porcentajePenalidad: number;
}

// ENT-09 · Incidencia (CU-02 / CU-04)
export type EstadoIncidencia = 'ABIERTA' | 'EN_REPARACION' | 'RESUELTA' | 'REPORTADA' | 'EN_REVISION' | string;

export interface Incidencia {
  idIncidencia: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  descripcion: string;
  estado: EstadoIncidencia;
  detalleResolucion?: string | null;
  costoEstimado?: number | null;
  fechaReporte: string;
  fechaResolucion?: string | null;
  amenity?: Amenity;
  unidadHabitacional?: UnidadHabitacional;
  nombreAmenity?: string;
  nombreUnidad?: string;
}

// ENT-10 · ListaEspera (CU-05)
export type EstadoListaEspera = 'ESPERANDO' | 'NOTIFICADO' | 'EXPIRADO' | 'CONFIRMADO' | string;
export type MotivoExpiracion =
  | 'NO_RESPONDIO'
  | 'CANCELO'
  | 'YA_NO_CUMPLE_ANTICIPACION'
  | 'AMENITY_DESHABILITADO'
  | string
  | null;

export interface ListaEspera {
  idListaEspera: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  idUsuario: number;
  fechaUso: string;
  horaInicio: string;
  posicion: number;
  fechaInscripcion: string;
  estado: EstadoListaEspera;
  fechaNotificacion?: string | null;
  fechaResolucion?: string | null;
  motivoExpiracion?: MotivoExpiracion;
  venceHoldEn?: string | null;
  amenity?: Amenity;
  unidadHabitacional?: UnidadHabitacional;
}

// ENT-07 · Invitado & Portería (CU-03)
export type EstadoAcceso = 'PERMITIDO' | 'DENEGADO' | string;

export interface Invitado {
  idInvitado: number;
  idUnidadHabitacional: number;
  nombre: string;
  apellido: string;
  dni: string;
  estadoAcceso: EstadoAcceso;
  horaIngreso?: string | null;
  horaEgreso?: string | null;
  unidadHabitacional?: UnidadHabitacional;
}

export interface AccesoResultadoDto {
  autorizado: boolean;
  motivo: string | null;
  unidadAnfitriona: string | null;
  idInvitado?: number | null;
}

// ENT-11 · MantenimientoProgramado (CU-10)
export interface MantenimientoProgramado {
  idMantenimiento: number;
  idAmenity: number;
  descripcion: string;
  recurrencia: string;
  horaInicio: string;
  horaFin: string;
  fechaInicio: string;
  fechaFin: string;
  amenity?: Amenity;
}

export interface DiaExcepcional {
  idDiaExcepcional: number;
  idAmenity?: number | null;
  fecha: string;
  tipo: 'FERIADO_CIERRA' | 'APERTURA_EXTRAORDINARIA' | string;
  nota?: string | null;
}

// ENT-12 · AuditLog & EventoAuditoria (CU-09)
export interface AuditLog {
  idAuditLog: number;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number;
  fechaHora: string;
  detalle: string;
}

export interface EventoAuditoria {
  idEvento: number;
  tenantId: string;
  entidad: string;
  idEntidad: number;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  idUsuario?: number | null;
  origen?: string | null;
  detalle?: string | null;
  timestamp: string;
}

// SPEC-CU12 DTOs (Disponibilidad)
export type MotivoNoDisponible =
  | 'OCUPADO'
  | 'MANTENIMIENTO'
  | 'FUERA_DE_SERVICIO'
  | 'ANTICIPACION_MINIMA_NO_CUMPLIDA'
  | 'LIMITE_MENSUAL_ALCANZADO'
  | 'RESERVADO_LISTA_ESPERA'
  | 'FERIADO'
  | string
  | null;

export interface DisponibilidadSlotDto {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  motivoNoDisponible: MotivoNoDisponible;
}

export interface DisponibilidadDiaDto {
  fecha: string;
  slots: DisponibilidadSlotDto[];
}

export interface DisponibilidadResponseDto {
  idAmenity: number;
  nombreAmenity: string;
  estadoAmenity: 'DISPONIBLE' | 'FUERA_DE_SERVICIO' | string;
  configuracion: AmenityConfig;
  ventanaConsultableDesde: string;
  ventanaConsultableHasta: string;
  cupoRestanteUnidadMes?: number | null;
  dias: DisponibilidadDiaDto[];
}

// SPEC-AUTH v2 Usuario & UsuarioUnidad
export interface Usuario {
  idUsuario: number;
  email: string;
  rol:
    | 'SUPER_ADMINISTRADOR'
    | 'ADMINISTRADOR_AVANZADO'
    | 'ADMINISTRADOR_LIVIANO'
    | 'GUARDIA'
    | 'INQUILINO'
    | 'PROPIETARIO'
    | 'INVITADO'
    | string;
  activo: boolean;
}

export interface UsuarioUnidad {
  idUsuarioUnidad: number;
  idUsuario: number;
  idUnidadHabitacional: number;
  tipoRelacion: 'PROPIETARIO' | 'INQUILINO' | string;
  esOcupanteActual: boolean;
  fechaInicio: string;
  fechaFin?: string | null;
  unidadHabitacional?: UnidadHabitacional;
}
