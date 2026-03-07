import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, Info } from 'lucide-react';

type BadgeVariant = 'verified' | 'active' | 'pending' | 'revoked' | 'info' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const config: Record<BadgeVariant, { style: string; Icon: React.ElementType | null }> = {
  verified: {
    style: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    Icon: CheckCircle,
  },
  active: {
    style: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    Icon: CheckCircle,
  },
  pending: {
    style: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
    Icon: Clock,
  },
  revoked: {
    style: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
    Icon: XCircle,
  },
  info: {
    style: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    Icon: Info,
  },
  neutral: {
    style: 'bg-[var(--bg-surface)] text-[var(--text-secondary)]',
    Icon: null,
  },
};

export function Badge({ variant, children, className }: BadgeProps) {
  const { style, Icon } = config[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-caption font-semibold',
        style,
        className,
      )}
      role="status"
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
