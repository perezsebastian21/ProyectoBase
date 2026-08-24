import { UserRole } from '@/types/roles';

export type AuthPolicy = 'RESIDENTE' | 'ADMINISTRADOR';

/**
 * Evalúa si los roles provistos satisfacen una política de autorización backend.
 *
 * - Policy RESIDENTE: Otorga acceso a usuarios con rol INQUILINO o PROPIETARIO.
 * - Policy ADMINISTRADOR: Otorga acceso a usuarios con rol ADMINISTRADOR_AVANZADO o SUPER_ADMINISTRADOR.
 *
 * @param userRoles Roles asignados al usuario o rol activo actual
 * @param policy Nombre de la política a evaluar ('RESIDENTE' | 'ADMINISTRADOR')
 */
export function hasPolicy(userRoles: UserRole | UserRole[] | null | undefined, policy: AuthPolicy): boolean {
  if (!userRoles) return false;

  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

  switch (policy) {
    case 'RESIDENTE':
      return rolesArray.some((r) => r === 'INQUILINO' || r === 'PROPIETARIO');

    case 'ADMINISTRADOR':
      return rolesArray.some((r) => r === 'ADMINISTRADOR_AVANZADO' || r === 'SUPER_ADMINISTRADOR');

    default:
      return false;
  }
}

/**
 * Comprueba si los roles provistos incluyen un rol específico.
 */
export function hasRole(userRoles: UserRole | UserRole[] | null | undefined, targetRole: UserRole): boolean {
  if (!userRoles) return false;
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  return rolesArray.includes(targetRole);
}
