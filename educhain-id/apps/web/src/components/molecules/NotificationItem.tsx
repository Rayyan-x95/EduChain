import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';

interface NotificationItemProps {
  avatar?: string | null;
  name: string;
  message: string;
  timestamp: string;
  read?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NotificationItem({
  avatar,
  name,
  message,
  timestamp,
  read = false,
  onClick,
  className,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 transition-colors duration-fast cursor-pointer',
        !read && 'bg-[var(--color-primary-subtle)]',
        'hover:bg-[var(--bg-surface)]',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <Avatar src={avatar} alt={name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-body text-[var(--text-primary)] line-clamp-2">{message}</p>
        <span className="text-caption text-[var(--text-tertiary)] mt-0.5 block">{timestamp}</span>
      </div>
      {!read && (
        <span className="shrink-0 mt-2 h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-label="Unread" />
      )}
    </div>
  );
}
