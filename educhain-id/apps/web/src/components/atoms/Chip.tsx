import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function Chip({
  children,
  selected = false,
  removable = false,
  disabled = false,
  onRemove,
  onClick,
  className,
}: ChipProps) {
  const isInteractive = !!onClick || removable;

  const Component = isInteractive ? 'button' : 'span';

  return (
    <Component
      className={cn(
        'inline-flex items-center gap-1 h-7 px-3 rounded-full text-caption font-medium',
        'border transition-colors duration-fast',
        selected
          ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] text-[var(--color-primary)]'
          : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)]',
        disabled && 'opacity-40 cursor-not-allowed',
        isInteractive && !disabled && 'cursor-pointer hover:border-[var(--color-primary)]',
        className,
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type={isInteractive ? 'button' : undefined}
    >
      {children}
      {removable && !disabled && (
        <X
          className="h-3.5 w-3.5 ml-0.5 hover:text-[var(--color-danger)]"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        />
      )}
    </Component>
  );
}
