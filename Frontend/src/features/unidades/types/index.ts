/**
 * Tipos e Interfaces para el módulo de Unidades Habitacionales.
 */

export interface UnidadHabitacional {
  idUnidadHabitacional: number;
  idComplejo: number;
  identificador: string;
  debeExpensas: boolean;
  saldoActual: number;
  estadoUnidad: string;
  contadorInfracciones: number;
  nombreComplejo?: string; // Nombre del complejo asociado para mostrar en la interfaz
}

export interface CreateUnidadPayload {
  idComplejo: number;
  identificador: string;
  debeExpensas: boolean;
  saldoActual: number;
  estadoUnidad: string;
  contadorInfracciones: number;
}

export interface UpdateUnidadPayload extends CreateUnidadPayload {
  idUnidadHabitacional: number;
}

export interface UnidadesListParams {
  page: number;
  limit: number;
  search?: string;
}
