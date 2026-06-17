/**
 * Tipos e Interfaces para el módulo de Complejos.
 */

export type TipoComplejo = 'EDIFICIO' | 'BARRIO_CERRADO' | 'OTRO';

export interface Complejo {
  idComplejo: number;
  idConsorcio: number;
  nombre: string;
  tipo: TipoComplejo | string;
  direccion: string;
  nombreConsorcio?: string; // Nombre del consorcio asociado para mostrar en la interfaz
}

export interface CreateComplejoPayload {
  idConsorcio: number;
  nombre: string;
  tipo: TipoComplejo | string;
  direccion: string;
}

export interface UpdateComplejoPayload extends CreateComplejoPayload {
  idComplejo: number;
}

export interface ComplejosListParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ComplejosState {
  items: Complejo[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  searchQuery: string;
}
