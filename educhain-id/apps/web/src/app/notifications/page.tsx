'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useMarkNotificationRead, useNotifications } from '@/hooks/api';

type NotificationRecord = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string | Date;
};

function formatRelativeDate(value: string | Date) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const notificationsQuery = useNotifications(page);
  const markAsRead = useMarkNotificationRead();

  const payload = (notificationsQuery.data ?? {}) as {
    notifications?: NotificationRecord[];
    total?: number;
    page?: number;
    limit?: number;
  };
  const notifications = useMemo(
    () => (payload.notifications ?? []) as NotificationRecord[],
    [payload.notifications],
  );
  const filtered = useMemo(
    () => notifications.filter((notification) => (tab === 'unread' ? !notification.read : true)),
    [notifications, tab],
  );

  const totalPages =
    payload.total && payload.limit ? Math.max(1, Math.ceil(payload.total / payload.limit)) : 1;

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <TopAppBar
        title="Notifications"
        showBack
        onBack={() => router.back()}
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            disabled={notifications.every((notification) => notification.read) || markAsRead.isPending}
            onClick={() => {
              notifications
                .filter((notification) => !notification.read)
                .forEach((notification) => markAsRead.mutate(notification.id));
            }}
            aria-label="Mark all as read"
          >
            <CheckCheck className="h-5 w-5" />
          </Button>
        }
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Notification Center
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Stay on top of verification activity
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                New credentials, collaboration events, and trust-related changes appear here as soon
                as they happen.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {(['all', 'unread'] as const).map((value) => (
                <button
                  key={value}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    tab === value
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--bg-default)] text-[var(--text-secondary)]'
                  }`}
                  onClick={() => setTab(value)}
                >
                  {value === 'all' ? 'All' : 'Unread'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {notificationsQuery.isLoading ? (
          <section className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
              />
            ))}
          </section>
        ) : notificationsQuery.isError ? (
          <ErrorState
            title="Notifications unavailable"
            message="We couldn't load your latest alerts."
            onRetry={() => void notificationsQuery.refetch()}
          />
        ) : filtered.length > 0 ? (
          <section className="space-y-4">
            {filtered.map((notification) => (
              <button
                key={notification.id}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead.mutate(notification.id);
                  }
                }}
                className={`w-full rounded-[28px] border p-6 text-left shadow-sm transition-colors ${
                  notification.read
                    ? 'border-[var(--border-default)] bg-[var(--bg-elevated)]'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-[var(--bg-default)] p-3 text-[var(--color-primary)]">
                    {notification.read ? <Bell className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                          {notification.type.replaceAll('_', ' ')}
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                          {notification.title}
                        </h2>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {formatRelativeDate(notification.createdAt)}
                      </span>
                    </div>
                    {notification.body && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                        {notification.body}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
            No {tab === 'unread' ? 'unread ' : ''}notifications right now.
          </div>
        )}

        <section className="flex items-center justify-between rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 shadow-sm">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <p className="text-sm text-[var(--text-secondary)]">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        <div className="text-center text-sm text-[var(--text-secondary)]">
          Need deeper profile controls? Visit{' '}
          <Link href="/settings/privacy" className="font-semibold text-[var(--color-primary)] hover:underline">
            privacy settings
          </Link>
          .
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
