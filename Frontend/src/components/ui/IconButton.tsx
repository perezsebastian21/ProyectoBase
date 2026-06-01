"use client";

import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function IconButton({
  children,
  icon,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-surface-bright/40 bg-brand-surface-container/60 hover:bg-brand-surface-bright/20 hover:border-brand-surface-bright/80 text-slate-200 hover:text-white text-xs font-medium tracking-wider uppercase transition-all duration-300 backdrop-blur-sm active:scale-[0.98] cursor-pointer ${className}`}
      {...props}
    >
      {icon && (
        <span className="w-4 h-4 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}
