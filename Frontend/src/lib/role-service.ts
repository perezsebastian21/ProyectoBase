import { UserRole } from '@/types/roles';

const ROLE_COOKIE_NAME = 'auth_role';
const ROLE_STORAGE_KEY = 'auth_role';
const USER_ROLES_STORAGE_KEY = 'auth_user_roles';

const VALID_ROLES: UserRole[] = [
  'SUPER_ADMINISTRADOR',
  'ADMINISTRADOR_AVANZADO',
  'ADMINISTRADOR_LIVIANO',
  'GUARDIA',
  'INQUILINO',
  'PROPIETARIO',
  'INVITADO',
];

export const roleService = {
  /**
   * Obtiene el rol activo guardado (de cookie o localStorage)
   */
  getActiveRole(): UserRole | null {
    if (typeof window === 'undefined') return null;

    // 1. Intentar leer de Cookie
    const match = document.cookie.match(new RegExp('(^| )' + ROLE_COOKIE_NAME + '=([^;]+)'));
    if (match && match[2]) {
      const role = match[2] as UserRole;
      if (VALID_ROLES.includes(role)) {
        return role;
      }
    }

    // 2. Intentar leer de LocalStorage
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (storedRole && VALID_ROLES.includes(storedRole)) {
      return storedRole;
    }

    return null;
  },

  /**
   * Guarda el rol seleccionado en Cookie (para proxy.ts) y en LocalStorage
   */
  setActiveRole(role: UserRole): void {
    if (typeof window === 'undefined') return;

    // Cookie válida por 7 días
    document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  },

  /**
   * Obtiene la lista de roles asignados al usuario autenticado (del login)
   */
  getUserRoles(): UserRole[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(USER_ROLES_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((r) => VALID_ROLES.includes(r as UserRole)) as UserRole[];
      }
    } catch {
      // Ignorar error de parsing
    }
    return [];
  },

  /**
   * Guarda la lista de roles asignados devuelta en el JWT/Login
   */
  setUserRoles(roles: UserRole[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_ROLES_STORAGE_KEY, JSON.stringify(roles));
  },

  /**
   * Elimina la cookie y el localStorage del rol
   */
  clearActiveRole(): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${ROLE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(USER_ROLES_STORAGE_KEY);
  }
};
