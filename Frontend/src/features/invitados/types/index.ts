export interface Invitado {
  idInvitado: number;
  idUnidadHabitacional: number;
  nombreCompleto: string;
  dni: string;
  fechaExpiracion: string;
  patente: string;
  nombreUnidad?: string; // Para mostrar en UI
}

export interface CreateInvitadoPayload {
  idUnidadHabitacional: number;
  nombreCompleto: string;
  dni: string;
  fechaExpiracion: string;
  patente: string;
}

export interface UpdateInvitadoPayload extends CreateInvitadoPayload {
  idInvitado: number;
}
