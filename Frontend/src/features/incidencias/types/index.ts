export interface Incidencia {
  idIncidencia: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  descripcion: string;
  estado: string;
  detalleResolucion?: string | null;
  costoEstimado?: number | null;
  fechaReporte: string;
  fechaResolucion?: string | null;
  nombreAmenity?: string;
  nombreUnidad?: string;
}

export interface CreateIncidenciaPayload {
  idAmenity: number;
  idUnidadHabitacional: number;
  descripcion: string;
  estado?: string;
  detalleResolucion?: string | null;
  costoEstimado?: number | null;
}

export interface UpdateIncidenciaPayload extends CreateIncidenciaPayload {
  idIncidencia: number;
}
