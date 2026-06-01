"use client";

import React from "react";

export type NavItem = "inicio" | "incidencias" | "comunidad" | "perfil";

interface BottomNavBarProps {
  activeTab: NavItem;
  onChange: (tab: NavItem) => void;
}

export default function BottomNavBar({ activeTab, onChange }: BottomNavBarProps) {
  const items = [
    {
      id: "inicio" as NavItem,
      label: "Inicio",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "incidencias" as NavItem,
      label: "Incidencias",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      id: "comunidad" as NavItem,
      label: "Comunidad",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "perfil" as NavItem,
      label: "Perfil",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="flex items-center justify-around py-1.5 px-2 rounded-full border border-white/10 bg-slate-950/45 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_-10px_rgba(59,130,246,0.15)] transition-all duration-300">
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
                className={`transition-all duration-300 z-10 ${
                  isActive
                    ? "text-brand-primary scale-110"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-[8px] font-semibold mt-0.5 tracking-widest uppercase transition-all duration-300 z-10 ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:text-slate-300"
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
