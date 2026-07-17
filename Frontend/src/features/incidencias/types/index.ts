export interface Incidencia {
  idIncidencia: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  descripcion: string;
  estado: string;
  detalleResolucion?: string;
  costoEstimado?: number;
  fechaReporte: string;
  fechaResolucion?: string;
  nombreAmenity?: string;
  nombreUnidad?: string;
}

export interface CreateIncidenciaPayload {
  idAmenity: number;
  idUnidadHabitacional: number;
  descripcion: string;
  estado: string;
  detalleResolucion?: string;
  costoEstimado?: number;
}

export interface UpdateIncidenciaPayload extends CreateIncidenciaPayload {
  idIncidencia: number;
}
