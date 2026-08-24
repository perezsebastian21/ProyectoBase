/**
 * Tipos e Interfaces para el módulo de Consorcios.
 */

export type ConsorcioEstado = 'active' | 'inactive' | 'pending' | 'suspended';

export interface Consorcio {
  idConsorcio: number;
  cuit: string;
  nombre: string;
  email: string;
  telefono: string;
  direccionLegal?: string;
  estado?: ConsorcioEstado;
  cantidadComplejos?: number;
  cantidadUnidades?: number;
  adminPrincipal?: string;
  planSaas?: string;
  createdAt?: string;
}

export interface CreateConsorcioPayload {
  cuit: string;
  nombre: string;
  email: string;
  telefono: string;
  direccionLegal?: string;
  estado?: ConsorcioEstado;
  planSaas?: string;
}

export interface UpdateConsorcioPayload extends CreateConsorcioPayload {
  idConsorcio: number;
}

export interface ConsorciosListParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ConsorciosState {
  items: Consorcio[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  searchQuery: string;
}

export interface ConsorcioDto {
  cuit: string;
  nombre: string;
  email: string;
  telefono?: string;
  timeZoneId?: string;
}

export interface ComplejoDto {
  nombre: string;
  tipo: 'EDIFICIO' | 'BARRIO_PRIVADO';
  direccion: string;
}

export interface UnidadDto {
  identificador: string;
  emailResidente?: string;
}

export interface AmenityConfigDto {
  horarioInicio: string;
  horarioFin: string;
  duracionBloqueMinutos: number;
  tiempoLimpiezaMinutos: number;
  tarifa: number;
  limiteReservasMesUnidad: number;
  requiereAprobacion: boolean;
}

export interface AmenityCreacionDto {
  nombre: string;
  capacidad: number;
  config: AmenityConfigDto;
}

export interface OnboardingRequestDto {
  consorcio: ConsorcioDto;
  complejo: ComplejoDto;
  unidades: UnidadDto[];
  amenities?: AmenityCreacionDto[];
}

export interface OnboardingResponseDto {
  idConsorcio: number;
  idComplejo: number;
  unidadesIds: number[];
  amenitiesIds: number[];
  status: string;
}

