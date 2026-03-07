import React from 'react';
import { cn } from '@/lib/utils';

type DividerVariant = 'default' | 'subtle' | 'section';

interface DividerProps {
  variant?: DividerVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<DividerVariant, string> = {
  default: 'border-[var(--border-default)] my-4',
  subtle: 'border-[var(--border-subtle)] my-2',
  section: 'border-[var(--border-default)] my-8',
};

export function Divider({ variant = 'default', label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4 my-6', className)} role="separator">
        <div className="flex-1 border-t border-[var(--border-default)]" />
        <span className="text-caption text-[var(--text-tertiary)] shrink-0">{label}</span>
        <div className="flex-1 border-t border-[var(--border-default)]" />
      </div>
    );
  }

  return (
    <hr
      className={cn('border-t', variantStyles[variant], className)}
      role="separator"
    />
  );
}
