import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-body-medium',
              error ? 'text-[var(--color-danger)]' : 'text-[var(--text-secondary)]',
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 text-body bg-[var(--bg-surface)] rounded-md border transition-colors duration-fast',
              'placeholder:text-[var(--text-tertiary)]',
              'focus:outline-none focus:border-[var(--border-focus)] focus:shadow-focus',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error
                ? 'border-[var(--color-danger)]'
                : 'border-[var(--border-default)]',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-caption text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-caption text-[var(--text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
