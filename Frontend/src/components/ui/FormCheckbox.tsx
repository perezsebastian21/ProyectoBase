import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="flex items-center h-5 mt-0.5">
            <input
              type="checkbox"
              ref={ref}
              className={cn(
                "w-4 h-4 rounded border-[var(--brand-surface-bright)] bg-transparent text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-2",
                error ? "border-red-500 focus:ring-red-500" : "",
                className
              )}
              {...props}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--foreground)] leading-none mt-1">
              {label}
            </span>
            {description && (
              <span className="text-xs text-gray-500 mt-1">{description}</span>
            )}
          </div>
        </label>
        {error && (
          <span className="text-xs text-red-500 ml-7">{error}</span>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
