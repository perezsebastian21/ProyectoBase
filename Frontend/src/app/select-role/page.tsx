'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { USER_ROLES, UserRole } from '@/types/roles';
import { roleService } from '@/lib/role-service';

export default function SelectRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentActiveRole, setCurrentActiveRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Verificar si ya tiene un rol activo previo
    const active = roleService.getActiveRole();
    if (active) {
      setCurrentActiveRole(active);
      setSelectedRole(active);
    }
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

  // Helper para renderizar los íconos de cada rol
  const renderRoleIcon = (roleId: UserRole) => {
    switch (roleId) {
      case 'SuperAdmin':
        return (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'Consorcio':
        return (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Inquilino':
        return (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'Invitado':
        return (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        );
    }
  };

  const roleKeys: UserRole[] = ['SuperAdmin', 'Consorcio', 'Inquilino', 'Invitado'];

  return (
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Modo Temporal - Selección de Perfil
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
          ¿Con qué perfil deseas ingresar?
        </h1>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
          Seleccioná un rol para probar y explorar el flujo de trabajo correspondiente. Podrás cambiar de perfil en cualquier momento desde tu cuenta.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-5xl mx-auto w-full my-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {roleKeys.map((key) => {
          const config = USER_ROLES[key];
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
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${config.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {renderRoleIcon(key)}
                  </div>
                  
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${config.badgeColor}`}>
                    {config.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-primary transition-colors">
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
                <div className="pt-2 space-y-1.5">
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

                <div className={`w-9 h-9 rounded-full bg-brand-surface-container dark:bg-slate-800 group-hover:bg-brand-primary group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all duration-300 ${isSelected && isSubmitting ? 'bg-brand-primary text-white animate-spin' : ''}`}>
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
