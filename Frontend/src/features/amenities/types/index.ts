export interface Amenity {
  idAmenity: number;
  idComplejo: number;
  nombre: string;
  capacidad: number;
  estado: string;
  nombreComplejo?: string; // Para UI
}

export interface CreateAmenityPayload {
  idComplejo: number;
  nombre: string;
  capacidad: number;
  estado: string;
}

export interface UpdateAmenityPayload extends CreateAmenityPayload {
  idAmenity: number;
}

export interface AmenityConfig {
  idAmenityConfig: number;
  idAmenity: number;
  horarioInicio: string; // "HH:mm"
  horarioFin: string; // "HH:mm"
  duracionBloqueMinutos: number;
  tiempoLimpiezaMinutos: number;
  tarifa: number;
  limiteReservasMesUnidad: number;
  requiereAprobacion: boolean;
  nombreAmenity?: string; // Para UI
}

export interface CreateAmenityConfigPayload {
  idAmenity: number;
  horarioInicio: string;
  horarioFin: string;
  duracionBloqueMinutos: number;
  tiempoLimpiezaMinutos: number;
  tarifa: number;
  limiteReservasMesUnidad: number;
  requiereAprobacion: boolean;
}

export interface UpdateAmenityConfigPayload extends CreateAmenityConfigPayload {
  idAmenityConfig: number;
}
