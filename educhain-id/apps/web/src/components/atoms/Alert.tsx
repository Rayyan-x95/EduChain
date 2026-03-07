import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
  success: { bg: 'bg-[var(--color-success-light)]', border: 'border-[var(--color-success)]', icon: <CheckCircle className="h-5 w-5 text-[var(--color-success)]" /> },
  error: { bg: 'bg-[var(--color-danger-light)]', border: 'border-[var(--color-danger)]', icon: <AlertCircle className="h-5 w-5 text-[var(--color-danger)]" /> },
  warning: { bg: 'bg-[var(--color-warning-light)]', border: 'border-[var(--color-warning)]', icon: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" /> },
  info: { bg: 'bg-[var(--color-info-light)]', border: 'border-[var(--color-primary)]', icon: <Info className="h-5 w-5 text-[var(--color-primary)]" /> },
};

export function Alert({ variant, title, children, onDismiss, className }: AlertProps) {
  const config = alertConfig[variant];
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 p-4 rounded-md border', config.bg, config.border, className)}
    >
      <span className="shrink-0 mt-0.5">{config.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-body-medium text-[var(--text-primary)]">{title}</p>}
        <div className="text-body text-[var(--text-secondary)]">{children}</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
