import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
  rightAction?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBack,
  showClose,
  onBack,
  onClose,
  className,
  rightAction
}) => {
  return (
    <div className={cn('flex items-center justify-between p-4 bg-transparent', className)}>
      <div className="flex size-12 shrink-0 items-center justify-center">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Button>
        )}
        {showClose && !showBack && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined text-2xl">close</span>
          </Button>
        )}
      </div>
      
      {title && (
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          {title}
        </h2>
      )}

      {rightAction && (
        <div className="flex items-center justify-end">
          {rightAction}
        </div>
      )}
    </div>
  );
};