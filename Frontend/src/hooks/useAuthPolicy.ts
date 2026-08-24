'use client';

import { useState, useEffect } from 'react';
import { roleService } from '@/lib/role-service';
import { hasPolicy, hasRole, type AuthPolicy } from '@/lib/policy-utils';
import type { UserRole } from '@/types/roles';

export function useAuthPolicy() {
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [userRoles, setUserRolesState] = useState<UserRole[]>([]);

  useEffect(() => {
    setActiveRoleState(roleService.getActiveRole());
    setUserRolesState(roleService.getUserRoles());
  }, []);

  const checkPolicy = (policy: AuthPolicy): boolean => {
    // Primero verifica con el rol activo actual, o si falla, con la lista completa de roles asignados
    return hasPolicy(activeRole, policy) || hasPolicy(userRoles, policy);
  };

  const checkRole = (role: UserRole): boolean => {
    return activeRole === role || hasRole(userRoles, role);
  };

  return {
    activeRole,
    userRoles,
    checkPolicy,
    checkRole,
    isResidente: checkPolicy('RESIDENTE'),
    isAdmin: checkPolicy('ADMINISTRADOR'),
  };
}
