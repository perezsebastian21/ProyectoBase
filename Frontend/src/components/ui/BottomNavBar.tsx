"use client";

import React from "react";

export type NavItem = "inicio" | "consorcios" | "complejos" | "perfil";

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
      id: "consorcios" as NavItem,
      label: "Consorcios",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "complejos" as NavItem,
      label: "Complejos",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 21h18M3 10h6v11H3V10zm12-6h6v17h-6V4zm-6 9h6v8H9v-8z" />
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
                className={`transition-all duration-300 z-10 ${
                  isActive
                    ? "text-brand-primary scale-110"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-[8px] font-semibold mt-0.5 tracking-widest uppercase transition-all duration-300 z-10 ${
                  isActive
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
