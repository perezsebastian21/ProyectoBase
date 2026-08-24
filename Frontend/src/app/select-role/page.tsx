'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { USER_ROLES, UserRole } from '@/types/roles';
import { roleService } from '@/lib/role-service';
import { Shield, Building2, UserCheck, ShieldAlert, Key, Home, User } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentActiveRole, setCurrentActiveRole] = useState<UserRole | null>(null);

  const [userAssignedRoles, setUserAssignedRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    // Verificar si ya tiene un rol activo previo
    const active = roleService.getActiveRole();
    if (active) {
      setCurrentActiveRole(active);
      setSelectedRole(active);
    }
    const assigned = roleService.getUserRoles();
    setUserAssignedRoles(assigned);
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);

    // Guardar rol seleccionado
    roleService.setActiveRole(role);

    // Redirigir a la URL deseada o al inicio
    const redirectTo = searchParams.get('redirect') || '/';

    setTimeout(() => {
      router.push(redirectTo);
      router.refresh();
    }, 300);
  };

  const handleLogout = () => {
    roleService.clearActiveRole();
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_username');
      localStorage.removeItem('auth_expiration');
    }
    router.push('/login');
  };

  const allRoles: UserRole[] = [
    'SUPER_ADMINISTRADOR',
    'ADMINISTRADOR_AVANZADO',
    'ADMINISTRADOR_LIVIANO',
    'GUARDIA',
    'INQUILINO',
    'PROPIETARIO',
    'INVITADO',
  ];

  // Si el usuario tiene roles asignados devueltos por la API, mostrar solo esos; de lo contrario mostrar todos en modo demo
  const roleKeys: UserRole[] = userAssignedRoles.length > 0 ? userAssignedRoles : allRoles;

  return (
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Modo Demo / Prueba de Perfiles (SPEC-AUTH v2)
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
          ¿Con qué perfil deseas ingresar?
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          Seleccioná un rol para explorar el flujo de trabajo correspondiente. Podrás cambiar de perfil en cualquier momento desde tu cuenta mientras el backend completa la emisión de roles en el token JWT.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto w-full my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {roleKeys.map((key) => {
          const config = USER_ROLES[key];
          if (!config) return null;
          const isCurrent = currentActiveRole === key;
          const isSelected = selectedRole === key;

          return (
            <div
              key={key}
              onClick={() => handleSelectRole(key)}
              className={`group relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                isSelected && isSubmitting
                  ? 'border-brand-primary bg-brand-surface dark:bg-slate-900/80 ring-2 ring-brand-primary shadow-xl scale-[1.01]'
                  : 'border-brand-surface-bright/20 dark:border-white/10 bg-brand-surface/90 dark:bg-slate-900/40 hover:border-brand-primary/50 hover:bg-brand-surface dark:hover:bg-slate-900/70 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Highlight ribbon for currently active role */}
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-md">
                  Perfil Actual
                </div>
              )}

              <div className="space-y-4">
                {/* Header of the Card */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${config.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Shield className="w-6 h-6" />
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-primary transition-colors">
                    {config.title}
                  </h3>
                  <p className="text-xs text-brand-primary font-semibold tracking-wide">
                    {config.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  {config.description}
                </p>

                {/* Key Features List */}
                <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-white/5">
                  {config.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  Ingresar como {config.title}
                </span>

                <div className={`w-8 h-8 rounded-full bg-brand-surface-container dark:bg-slate-800 group-hover:bg-brand-primary group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all duration-300 ${isSelected && isSubmitting ? 'bg-brand-primary text-white animate-spin' : ''}`}>
                  {isSelected && isSubmitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="max-w-md mx-auto w-full text-center relative z-10 space-y-2">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
