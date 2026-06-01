"use client";

import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  showArrow?: boolean;
}

export default function PrimaryButton({
  children,
  showArrow = false,
  className = "",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`group relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold tracking-wide transition-all duration-300 shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] active:scale-[0.98] cursor-pointer overflow-hidden ${className}`}
      {...props}
    >
      {/* Glossy top reflection glow */}
      <span className="absolute inset-x-0 top-0 h-[1px] bg-white/25 transition-opacity group-hover:bg-white/40" />

      {/* Background radial gradient accent on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-brand-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

      <span className="relative z-10">{children}</span>

      {showArrow && (
        <svg
          className="relative z-10 w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </button>
  );
}
