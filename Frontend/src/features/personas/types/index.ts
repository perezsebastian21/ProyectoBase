export interface Persona {
  idPersona: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  email: string;
  celular: string;
}

export interface CreatePersonaPayload {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  email: string;
  celular: string;
}

export interface UpdatePersonaPayload extends CreatePersonaPayload {
  idPersona: number;
}
