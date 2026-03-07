'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '@/hooks/api';

type FilterType = 'all' | 'unread';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const notifications = data?.notifications ?? [];
  const filtered = filter === 'unread' ? notifications.filter((n: any) => !n.read) : notifications;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAsRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">Notifications</h1>
          <p className="text-body text-[var(--text-secondary)]">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-[var(--border-default)] pb-1">
        {(['all', 'unread'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-body-medium capitalize transition-colors border-b-2 -mb-[5px] ${
              filter === f
                ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
            }`}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <Badge variant="info" className="ml-1">{unreadCount}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-body text-[var(--text-secondary)]">No notifications</p>
            </div>
          ) : (
            filtered.map((n: any) => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  n.read
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]'
                    : 'bg-[var(--bg-surface)] border-[var(--color-primary-subtle)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-transparent' : 'bg-[var(--color-primary)]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium text-[var(--text-primary)]">{n.title}</p>
                    <p className="text-caption text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                    <p className="text-overline text-[var(--text-tertiary)] mt-1">{n.createdAt ?? n.time}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
