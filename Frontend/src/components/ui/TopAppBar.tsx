"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleService } from "@/lib/role-service";
import { UserRole, USER_ROLES } from "@/types/roles";
import { useConsorcioActivo } from "@/components/providers";

interface TopAppBarProps {
  title: string;
  onAvatarClick?: () => void;
}

export default function TopAppBar({
  title,
  onAvatarClick,
}: TopAppBarProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const { consorcioActivo, complejoActivo } = useConsorcioActivo();

  useEffect(() => {
    // Check if the html tag has 'dark' class
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);

    // Leer rol activo
    const role = roleService.getActiveRole();
    if (role) {
      setActiveRole(role);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark === null) return;
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const handleRoleBadgeClick = () => {
    router.push('/select-role');
  };

  const roleConfig = activeRole ? USER_ROLES[activeRole] : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-surface-bright/20 bg-brand-background/80 backdrop-blur-lg px-4 sm:px-6 py-3.5 flex items-center justify-between transition-all duration-300">

      {/* Left section: Active Role Badge + Perfil Activo */}
      <div className="flex items-center gap-2 z-10">
        {roleConfig ? (
          <button
            onClick={handleRoleBadgeClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm ${roleConfig.badgeColor}`}
            title="Hacé clic para cambiar de rol"
          >
            <span className="hidden sm:inline">Rol:</span>
            <span>{roleConfig.title}</span>
            <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-16 h-6" />
        )}

        {/* Chip: Perfil de Consorcio/Edificio activo — solo visible para el rol Administrador Avanzado */}
        {activeRole === 'ADMINISTRADOR_AVANZADO' && (consorcioActivo || complejoActivo) && (
          <button
            onClick={() => router.push('/')}
            title="Clic para cambiar el edificio activo"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm hover:bg-blue-500/20 max-w-[200px]"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">
              {complejoActivo ? complejoActivo.nombre : consorcioActivo?.nombre}
            </span>
            {consorcioActivo && complejoActivo && (
              <span className="opacity-60 shrink-0">·</span>
            )}
            {consorcioActivo && complejoActivo && (
              <span className="truncate opacity-70 text-[10px]">{consorcioActivo.nombre}</span>
            )}
          </button>
        )}
      </div>

      {/* Title — centered in the flex row */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <h1 className="text-sm sm:text-base font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase select-none">
          {title}
        </h1>
      </div>

      {/* Right Action (Theme Toggle + User Avatar) */}
      <div className="flex items-center gap-3 z-10">
        {isDark !== null ? (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-brand-surface-container/60 hover:bg-brand-surface-bright/20 border border-brand-surface-bright/10 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer active:scale-95 transition-all duration-200 focus:outline-none"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400 animate-[spin_10s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        ) : (
          <div className="w-9.5 h-9.5" />
        )}

        <button
          onClick={onAvatarClick}
          className="relative group rounded-full p-[2px] bg-gradient-to-tr from-brand-primary to-emerald-400 cursor-pointer active:scale-95 transition-all duration-200 focus:outline-none"
          aria-label="Perfil del usuario"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-brand-surface-container flex items-center justify-center border border-brand-background">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-brand-background shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
        </button>
      </div>
    </header>
  );
}
