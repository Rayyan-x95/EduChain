import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../atoms/Button';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'network' | 'generic';
  className?: string;
}

export function ErrorState({ title, message, onRetry, variant = 'generic', className }: ErrorStateProps) {
  const Icon = variant === 'network' ? WifiOff : AlertCircle;
  const defaultTitle = variant === 'network' ? 'Network Error' : 'Something went wrong';
  const defaultMessage = variant === 'network' ? 'Please check your internet connection and try again.' : 'An unexpected error occurred. Please try again.';

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <Icon className="h-12 w-12 text-[var(--color-danger)] mb-4" aria-hidden="true" />
      <p className="text-body-medium text-[var(--text-primary)]">{title ?? defaultTitle}</p>
      <p className="text-caption text-[var(--text-secondary)] mt-1 max-w-xs">{message ?? defaultMessage}</p>
      {onRetry && (
        <Button variant="outline" size="md" className="mt-4" onClick={onRetry} icon={<RefreshCw className="h-4 w-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
