import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={inputId} className="text-caption text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'w-full min-h-[100px] px-3 py-2 text-body rounded-md border transition-colors duration-fast resize-y',
            'bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : 'border-[var(--border-default)] focus:ring-[var(--color-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            props.disabled && 'opacity-50 cursor-not-allowed',
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-caption text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-caption text-[var(--text-tertiary)]">{helperText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
