"use client";

import React, { useState, useEffect } from "react";

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
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the html tag has 'dark' class
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-surface-bright/20 bg-brand-background/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Left Action (Menu) */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl bg-brand-surface-container/60 hover:bg-brand-surface-bright/20 border border-brand-surface-bright/10 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer active:scale-95 transition-all duration-200 focus:outline-none"
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
      <h1 className="text-base font-bold tracking-wider text-slate-800 dark:text-slate-100 uppercase select-none">
        {title}
      </h1>

      {/* Right Action (Theme Toggle + User Avatar) */}
      <div className="flex items-center gap-3">
        {isDark !== null ? (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-brand-surface-container/60 hover:bg-brand-surface-bright/20 border border-brand-surface-bright/10 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer active:scale-95 transition-all duration-200 focus:outline-none"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? (
              // Sun icon for switching to light mode
              <svg className="w-5 h-5 text-amber-400 animate-[spin_10s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              // Moon icon for switching to dark mode
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
      </div>
    </header>
  );
}
