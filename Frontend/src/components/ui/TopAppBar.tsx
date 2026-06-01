"use client";

import React from "react";

interface TopAppBarProps {
  title: string;
  onMenuClick?: () => void;
  onAvatarClick?: () => void;
}

export default function TopAppBar({
  title,
  onMenuClick,
  onAvatarClick,
}: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-surface-bright/20 bg-brand-background/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Left Action (Menu) */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl bg-brand-surface-container/60 hover:bg-brand-surface-bright/20 border border-brand-surface-bright/10 text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all duration-200"
        aria-label="Menú principal"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase select-none">
        {title}
      </h1>

      {/* Right Action (User Avatar) */}
      <button
        onClick={onAvatarClick}
        className="relative group rounded-full p-[2px] bg-gradient-to-tr from-brand-primary to-emerald-400 cursor-pointer active:scale-95 transition-all duration-200"
        aria-label="Perfil del usuario"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-brand-surface-container flex items-center justify-center border border-brand-background">
          {/* Svg avatar representation */}
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
    </header>
  );
}
