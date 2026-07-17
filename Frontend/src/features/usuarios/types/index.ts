/**
 * Tipos e Interfaces para el módulo de Usuarios.
 */

export interface Usuario {
  idUsuario: number;
  username: string;
  email: string;
  activo: boolean;
  password?: string; // Solo en creación/edición, no se suele devolver en el get
}

export interface CreateUsuarioPayload {
  username: string;
  email: string;
  password?: string;
  activo: boolean;
}

export interface UpdateUsuarioPayload extends CreateUsuarioPayload {
  idUsuario: number;
}

export interface UsuariosListParams {
  page: number;
  limit: number;
  search?: string;
}
