'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function RadioGroup({ name, value, onChange, options, orientation = 'vertical', className }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn('flex gap-3', orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col', className)}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'inline-flex items-center gap-2 cursor-pointer',
            opt.disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <span
            role="radio"
            aria-checked={value === opt.value}
            tabIndex={0}
            onClick={() => !opt.disabled && onChange?.(opt.value)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !opt.disabled) onChange?.(opt.value);
            }}
            className={cn(
              'flex items-center justify-center h-5 w-5 rounded-full border-2 transition-colors duration-fast',
              value === opt.value ? 'border-[var(--color-primary)]' : 'border-[var(--border-strong)]',
              !opt.disabled && 'hover:border-[var(--color-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-default)]',
            )}
          >
            {value === opt.value && (
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            )}
          </span>
          <span className="text-body text-[var(--text-primary)]">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
