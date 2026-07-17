export interface ListaEspera {
  idListaEspera: number;
  idAmenity: number;
  idUnidadHabitacional: number;
  fechaUso: string;
  horaInicio: string;
  posicion: number;
  fechaInscripcion: string;
  estado: string;
  nombreAmenity?: string;
  nombreUnidad?: string;
}

export interface CreateListaEsperaPayload {
  idAmenity: number;
  idUnidadHabitacional: number;
  fechaUso: string;
  horaInicio: string;
  posicion: number;
  estado: string;
}

export interface UpdateListaEsperaPayload extends CreateListaEsperaPayload {
  idListaEspera: number;
}
