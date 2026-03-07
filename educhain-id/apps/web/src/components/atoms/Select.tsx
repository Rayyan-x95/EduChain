import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOptionObj {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectOption = string | SelectOptionObj;

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function normalizeOption(opt: SelectOption): SelectOptionObj {
  if (typeof opt === 'string') return { value: opt, label: opt };
  return opt;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder, label, error, helperText, disabled, className, id }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${selectId}-error` : undefined;
    const normalizedOptions = options.map(normalizeOption);

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={selectId} className="text-caption text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={cn(
              'w-full h-10 pl-3 pr-9 text-body appearance-none rounded-md border transition-colors duration-fast',
              'bg-[var(--bg-surface)] text-[var(--text-primary)]',
              error
                ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
                : 'border-[var(--border-default)] focus:ring-[var(--color-primary)]',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
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

Select.displayName = 'Select';
