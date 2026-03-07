import React from 'react';
import { cn } from '../lib/utils';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  interactive?: boolean;
}

export function Chip({
  children,
  selected = false,
  removable = false,
  disabled = false,
  onClick,
  onRemove,
  className,
  interactive = true,
}: ChipProps) {
  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-medium transition-colors',
    disabled && 'opacity-50 cursor-not-allowed',
    selected
      ? 'bg-brand/10 text-brand border border-brand/30'
      : 'bg-elevated text-secondary border border-default',
    interactive && !disabled && 'hover:bg-brand/5 cursor-pointer',
    className,
  );

  const removeButton = removable && !disabled && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove?.();
      }}
      className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  if (interactive && onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={baseClasses} disabled={disabled}>
        {children}
        {removeButton}
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      {children}
      {removeButton}
    </span>
  );
}
