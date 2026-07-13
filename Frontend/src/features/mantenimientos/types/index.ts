export interface Mantenimiento {
  idMantenimiento: number;
  idAmenity: number;
  descripcion: string;
  recurrencia: string;
  horaInicio: string;
  horaFin: string;
  fechaInicio: string;
  fechaFin: string;
  nombreAmenity?: string;
}

export interface CreateMantenimientoPayload {
  idAmenity: number;
  descripcion: string;
  recurrencia: string;
  horaInicio: string;
  horaFin: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface UpdateMantenimientoPayload extends CreateMantenimientoPayload {
  idMantenimiento: number;
}
