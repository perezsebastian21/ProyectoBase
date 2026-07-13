export interface Inquilino {
  idInquilino: number;
  idUnidadHabitacional: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  activo: boolean;
  nombreUnidad?: string; // Para mostrar en la UI
}

export interface CreateInquilinoPayload {
  idUnidadHabitacional: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  activo: boolean;
}

export interface UpdateInquilinoPayload extends CreateInquilinoPayload {
  idInquilino: number;
}
