import React, { forwardRef } from 'react';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-4 py-3 rounded-xl bg-[var(--brand-surface-container)]/50 dark:bg-slate-950/40 border text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 appearance-none transition-all cursor-pointer ${
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-[var(--brand-surface-bright)]/30 focus:border-[var(--brand-primary)]/50 focus:ring-[var(--brand-primary)]/20'
            } ${className}`}
            {...props}
          >
            <option value="" disabled>Seleccionar...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';
