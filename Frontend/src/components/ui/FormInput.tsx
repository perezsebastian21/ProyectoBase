import React, { forwardRef } from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-[var(--brand-surface-container)]/50 dark:bg-slate-950/40 border text-[var(--foreground)] text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-[var(--brand-surface-bright)]/30 focus:border-[var(--brand-primary)]/50 focus:ring-[var(--brand-primary)]/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';
