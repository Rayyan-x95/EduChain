'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../atoms/Button';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
}

export function StatCard({ label, value, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
      className,
    )}>
      <p className="text-caption text-[var(--text-secondary)]">{label}</p>
      <p className="text-h2 text-[var(--text-primary)] mt-1">{value}</p>
      {trend && <p className="text-caption text-[var(--color-success)] mt-1">{trend}</p>}
    </div>
  );
}

interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-default)]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="text-left text-overline uppercase text-[var(--text-tertiary)] px-4 py-3"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-b border-[var(--border-subtle)] transition-colors duration-fast',
                onRowClick && 'cursor-pointer hover:bg-[var(--bg-surface)]',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-body text-[var(--text-primary)]">
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <span className="text-[var(--text-tertiary)] mb-3">{icon}</span>
      <p className="text-body text-[var(--text-primary)]">{title}</p>
      <p className="text-caption text-[var(--text-secondary)] mt-1 max-w-xs">{description}</p>
      {action && (
        <Button variant="primary" size="md" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Toast
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
}

const toastStyles: Record<string, string> = {
  success: 'bg-[var(--color-success-light)] border-l-[var(--color-success)]',
  error: 'bg-[var(--color-danger-light)] border-l-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-light)] border-l-[var(--color-warning)]',
  info: 'bg-[var(--color-info-light)] border-l-[var(--color-primary)]',
};

export function Toast({ variant, message, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-md border-l-[3px] animate-slide-up',
        toastStyles[variant],
      )}
      role="alert"
      aria-live="assertive"
    >
      <p className="flex-1 text-body text-[var(--text-primary)]">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}

// Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-[var(--bg-overlay)]" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-xl w-full max-w-[560px] mx-4 animate-scale-in outline-none"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 id="modal-title" className="text-h4 text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton loader
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton rounded-md', className)} aria-hidden="true" />
  );
}
