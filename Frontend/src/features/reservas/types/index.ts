export interface Reserva {
  idReserva: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  fechaUso: string;
  horaInicio: string;
  horaFin: string;
  cantidadInvitados: number;
  estado: string;
  fechaSolicitud: string;
  nombreAmenity?: string; // Para UI
  nombreUnidad?: string; // Para UI
}

export interface CreateReservaPayload {
  idAmenity: number;
  idUnidadHabitacional: number;
  fechaUso: string;
  horaInicio: string;
  horaFin: string;
  cantidadInvitados: number;
  estado: string;
}

export interface UpdateReservaPayload extends CreateReservaPayload {
  idReserva: number;
}
