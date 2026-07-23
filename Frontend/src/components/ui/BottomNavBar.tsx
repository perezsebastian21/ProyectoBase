"use client";

import React, { useState, useEffect } from "react";
import { roleService } from "@/lib/role-service";
import { UserRole } from "@/types/roles";

export type NavItem = "inicio" | "consorcios" | "complejos" | "reservas" | "incidencias" | "amenities" | "pase" | "perfil";

export interface NavItemConfig {
  id: NavItem;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavBarProps {
  activeTab: NavItem | string;
  onChange: (tab: NavItem | string) => void;
  role?: UserRole;
}

export default function BottomNavBar({ activeTab, onChange, role: propRole }: BottomNavBarProps) {
  const [activeRole, setActiveRole] = useState<UserRole>("SuperAdmin");

  useEffect(() => {
    if (propRole) {
      setActiveRole(propRole);
    } else {
      const current = roleService.getActiveRole();
      if (current) setActiveRole(current);
    }
  }, [propRole]);

  // Definición de íconos SVG reutilizables
  const icons = {
    inicio: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    consorcios: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    complejos: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 21h18M3 10h6v11H3V10zm12-6h6v17h-6V4zm-6 9h6v8H9v-8z" />
      </svg>
    ),
    reservas: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    incidencias: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
    amenities: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    pase: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    perfil: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  // Configuración de pestañas específicas por cada Rol
  const roleNavItems: Record<UserRole, NavItemConfig[]> = {
    SuperAdmin: [
      { id: "inicio", label: "Inicio", icon: icons.inicio },
      { id: "consorcios", label: "Consorcios", icon: icons.consorcios },
      { id: "complejos", label: "Complejos", icon: icons.complejos },
      { id: "perfil", label: "Perfil", icon: icons.perfil },
    ],
    Consorcio: [
      { id: "inicio", label: "Inicio", icon: icons.inicio },
      { id: "amenities", label: "Amenities", icon: icons.amenities },
      { id: "reservas", label: "Reservas", icon: icons.reservas },
      { id: "incidencias", label: "Incidencias", icon: icons.incidencias },
      { id: "perfil", label: "Perfil", icon: icons.perfil },
    ],
    Inquilino: [
      { id: "inicio", label: "Inicio", icon: icons.inicio },
      { id: "amenities", label: "Amenities", icon: icons.amenities },
      { id: "reservas", label: "Mis Reservas", icon: icons.reservas },
      { id: "perfil", label: "Perfil", icon: icons.perfil },
    ],
    Invitado: [
      { id: "inicio", label: "Inicio", icon: icons.inicio },
      { id: "pase", label: "Mi Pase", icon: icons.pase },
      { id: "perfil", label: "Perfil", icon: icons.perfil },
    ],
  };

  const items = roleNavItems[activeRole] || roleNavItems.SuperAdmin;

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-3">
      <div className="flex items-center justify-around py-1.5 px-2 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-slate-950/45 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] shadow-[0_0_50px_-10px_rgba(59,130,246,0.08)] dark:shadow-[0_0_50px_-10px_rgba(59,130,246,0.15)] transition-all duration-300">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3.5 rounded-full cursor-pointer transition-all duration-300 active:scale-95 group"
            >
              {/* Modern floating pill background highlight */}
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-primary/20 via-brand-primary/10 to-transparent border border-brand-primary/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(59,130,246,0.25)] animate-fade-in" />
              )}

              <div
                className={`transition-all duration-300 z-10 ${isActive
                    ? "text-brand-primary scale-110"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-[8px] font-semibold mt-0.5 tracking-widest uppercase transition-all duration-300 z-10 ${isActive
                    ? "text-slate-800 dark:text-white"
                    : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
