'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Toggle({ checked = false, onChange, label, disabled = false, size = 'md', className }: ToggleProps) {
  const dims = size === 'sm' ? { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', on: 'translate-x-4', off: 'translate-x-0.5' }
    : { track: 'h-6 w-11', thumb: 'h-4 w-4', on: 'translate-x-[22px]', off: 'translate-x-[2px]' };

  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-normal',
          dims.track,
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-default)]',
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white transition-transform duration-normal shadow-sm',
            dims.thumb,
            checked ? dims.on : dims.off,
          )}
        />
      </button>
      {label && <span className="text-body text-[var(--text-primary)]">{label}</span>}
    </label>
  );
}
