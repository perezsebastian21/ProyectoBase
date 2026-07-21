import { UserRole } from '@/types/roles';

const ROLE_COOKIE_NAME = 'auth_role';
const ROLE_STORAGE_KEY = 'auth_role';

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
      if (['SuperAdmin', 'Consorcio', 'Inquilino', 'Invitado'].includes(role)) {
        return role;
      }
    }

    // 2. Intentar leer de LocalStorage
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (storedRole && ['SuperAdmin', 'Consorcio', 'Inquilino', 'Invitado'].includes(storedRole)) {
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
   * Elimina la cookie y el localStorage del rol
   */
  clearActiveRole(): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${ROLE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    localStorage.removeItem(ROLE_STORAGE_KEY);
  }
};
