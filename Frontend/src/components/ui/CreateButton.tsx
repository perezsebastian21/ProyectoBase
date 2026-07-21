'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface CreateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
}

export function CreateButton({ label, icon, className = '', ...props }: CreateButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all duration-200 cursor-pointer ${className}`}
      {...props}
    >
      {icon ? icon : <Plus className="w-4 h-4 stroke-[2.5]" />}
      <span>{label}</span>
    </button>
  );
}

export default CreateButton;
