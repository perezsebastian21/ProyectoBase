import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types';
import type { Rol, UsuarioRol, AsignarRolPayload } from '../types';

/**
 * Servicio para gestión de roles de usuario.
 * Contrato: contratos_endpoints_gestion_roles.md
 */
export const rolService = {
  /**
   * Obtiene el catálogo completo de roles del sistema.
   * GET /Rol — Policy "ADMINISTRADOR"
   */
  async getCatalogo(): Promise<ApiResponse<Rol[]>> {
    return apiClient<ApiResponse<Rol[]>>(API_ENDPOINTS.ROL.GET_ALL, {
      method: 'GET',
    });
  },

  /**
   * Obtiene los roles activos de un usuario específico.
   * GET /Usuario/{idUsuario}/Roles — Policy "ADMINISTRADOR"
   */
  async getRolesDeUsuario(idUsuario: number): Promise<ApiResponse<Rol[]>> {
    return apiClient<ApiResponse<Rol[]>>(API_ENDPOINTS.ROL.GET_BY_USUARIO(idUsuario), {
      method: 'GET',
    });
  },

  /**
   * Asigna un rol a un usuario.
   * POST /Usuario/{idUsuario}/Roles — Policy "ADMINISTRADOR"
   * Devuelve 400 si el rol ya está asignado.
   */
  async asignarRol(idUsuario: number, payload: AsignarRolPayload): Promise<ApiResponse<UsuarioRol>> {
    return apiClient<ApiResponse<UsuarioRol>>(API_ENDPOINTS.ROL.ASIGNAR(idUsuario), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Remueve un rol de un usuario.
   * DELETE /Usuario/{idUsuario}/Roles/{idRol} — Policy "ADMINISTRADOR"
   * Devuelve 404 si la asignación no existe.
   */
  async removerRol(idUsuario: number, idRol: number): Promise<ApiResponse<boolean>> {
    return apiClient<ApiResponse<boolean>>(API_ENDPOINTS.ROL.REMOVER(idUsuario, idRol), {
      method: 'DELETE',
    });
  },
};
