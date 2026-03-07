'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Bell, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'credential_issued' | 'collaboration_request' | 'collaboration_accepted' | 'verification_completed' | 'general';
  avatar?: string | null;
  name: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (id: string) => void;
  className?: string;
}

export function NotificationCenter({ notifications, open, onClose, onMarkAllRead, onNotificationClick, className }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC + focus trap
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
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
    document.addEventListener('keydown', handleKeyDown);
    // Auto-focus the close button
    const closeBtn = panelRef.current?.querySelector<HTMLElement>('[aria-label="Close"]');
    closeBtn?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full sm:w-[380px] bg-[var(--bg-elevated)] border-l border-[var(--border-default)] shadow-xl animate-slide-in-right flex flex-col',
          className,
        )}
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--text-primary)]" />
            <h2 className="text-h4 text-[var(--text-primary)]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-medium rounded-full bg-[var(--color-primary)] text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && onMarkAllRead && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead}>Mark all read</Button>
            )}
            <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Bell className="h-12 w-12 text-[var(--text-tertiary)] mb-3" />
              <p className="text-body text-[var(--text-primary)]">No notifications</p>
              <p className="text-caption text-[var(--text-secondary)] mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onNotificationClick?.(n.id)}
                  className={cn(
                    'flex items-start gap-3 p-4 text-left w-full border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-surface)]',
                    !n.read && 'bg-[var(--color-primary-subtle)]',
                  )}
                >
                  <Avatar src={n.avatar} alt={n.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-[var(--text-primary)]">
                      <span className="font-medium">{n.name}</span>{' '}
                      {n.message}
                    </p>
                    <span className="text-caption text-[var(--text-tertiary)]">{n.timestamp}</span>
                  </div>
                  {!n.read && (
                    <span className="shrink-0 mt-2 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
