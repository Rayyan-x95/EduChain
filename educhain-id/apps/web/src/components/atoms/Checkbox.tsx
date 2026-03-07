'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Checkbox({ checked = false, onChange, label, disabled = false, id, className }: CheckboxProps) {
  const handleChange = () => {
    if (!disabled) onChange?.(!checked);
  };

  return (
    <label
      className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}
    >
      <button
        id={id}
        role="checkbox"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleChange}
        className={cn(
          'flex items-center justify-center h-5 w-5 rounded border-2 transition-colors duration-fast',
          checked
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : 'bg-transparent border-[var(--border-strong)]',
          !disabled && 'hover:border-[var(--color-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-default)]',
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
      </button>
      {label && <span className="text-body text-[var(--text-primary)]">{label}</span>}
    </label>
  );
}
