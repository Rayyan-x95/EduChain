'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Award, CalendarDays, ShieldCheck } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useMyAchievements } from '@/hooks/api';

type AchievementRecord = {
  id: string;
  title: string;
  description?: string | null;
  issuedBy?: string | null;
  date?: string | Date | null;
};

function formatDate(value?: string | Date | null) {
  if (!value) return 'Date not provided';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function AchievementDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const achievementsQuery = useMyAchievements();
  const achievements = useMemo(
    () =>
      (Array.isArray(achievementsQuery.data) ? achievementsQuery.data : []) as AchievementRecord[],
    [achievementsQuery.data],
  );

  const achievement = useMemo(
    () => achievements.find((entry) => entry.id === params.id),
    [achievements, params.id],
  );

  if (achievementsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </div>
    );
  }

  if (achievementsQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Achievement unavailable"
            message="We couldn't load this achievement right now."
            onRetry={() => void achievementsQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState title="Achievement not found" message="This achievement is not in your profile." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <TopAppBar
        title="Achievement"
        showBack
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                  Profile highlight
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                  Verified context
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                {achievement.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {achievement.description ?? 'No additional description was provided for this achievement.'}
              </p>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
              <Award className="h-10 w-10" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Issuer
              </p>
            </div>
            <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
              {achievement.issuedBy ?? 'Self-reported'}
            </p>
          </article>

          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[var(--color-primary)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Date
              </p>
            </div>
            <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
              {formatDate(achievement.date)}
            </p>
          </article>

          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              Why it matters
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Achievements add narrative context around your credentials and project work, especially
              when they come from a trusted institution or public event.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
