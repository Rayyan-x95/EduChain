'use client';

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useShortlist } from '@/hooks/api';

type ShortlistEntry = {
  createdAt?: string | Date;
  student?: {
    institution?: { name?: string | null } | null;
    graduationYear?: number | null;
    skills?: Array<{ skill?: { name?: string | null } | null }>;
  } | null;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Recruiter';
  return (email.split('@')[0] ?? 'Recruiter')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function RecruiterAnalyticsPage() {
  const { user } = useAuth();
  const shortlistQuery = useShortlist();

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'recruiter@educhain.local',
    avatar: null,
  };

  const shortlist = useMemo(
    () =>
      ((((shortlistQuery.data as { shortlist?: ShortlistEntry[] } | undefined)?.shortlist) ??
        []) as ShortlistEntry[]),
    [shortlistQuery.data],
  );

  const analytics = useMemo(() => {
    const institutionCounts = new Map<string, number>();
    const skillCounts = new Map<string, number>();
    const gradYears: number[] = [];

    shortlist.forEach((entry) => {
      const institution = entry.student?.institution?.name?.trim();
      if (institution) {
        institutionCounts.set(institution, (institutionCounts.get(institution) ?? 0) + 1);
      }

      const year = entry.student?.graduationYear;
      if (year) gradYears.push(year);

      (entry.student?.skills ?? []).forEach((skill) => {
        const name = skill.skill?.name?.trim();
        if (name) {
          skillCounts.set(name, (skillCounts.get(name) ?? 0) + 1);
        }
      });
    });

    const topInstitutions = Array.from(institutionCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
    const topSkills = Array.from(skillCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6);

    const averageGradYear =
      gradYears.length > 0
        ? Math.round(gradYears.reduce((sum, year) => sum + year, 0) / gradYears.length)
        : null;

    return {
      totalShortlisted: shortlist.length,
      uniqueInstitutions: institutionCounts.size,
      averageGradYear,
      topInstitutions,
      topSkills,
    };
  }, [shortlist]);

  if (shortlistQuery.isLoading) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
            />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (shortlistQuery.isError) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <ErrorState
          title="Recruiter analytics unavailable"
          message="We couldn't compute analytics from your shortlist."
          onRetry={() => void shortlistQuery.refetch()}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recruiter" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Pipeline Analytics
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Real signals from your shortlist
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          These analytics are computed from the candidates you have actually shortlisted, not from
          placeholder pipeline numbers.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Shortlisted', analytics.totalShortlisted],
          ['Institutions', analytics.uniqueInstitutions],
          ['Avg Grad Year', analytics.averageGradYear ?? 'N/A'],
          ['Top Skill Signals', analytics.topSkills.length],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              {label}
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Top Institutions
          </p>
          <div className="mt-6 space-y-4">
            {analytics.topInstitutions.length > 0 ? (
              analytics.topInstitutions.map(([institution, count]) => (
                <div key={institution}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--text-primary)]">{institution}</span>
                    <span className="text-[var(--text-secondary)]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-default)]">
                    <div
                      className="h-2 rounded-full bg-[var(--color-primary)]"
                      style={{
                        width: `${Math.max(18, (count / analytics.totalShortlisted) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Shortlist candidates to start seeing institution concentration.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Top Skills
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {analytics.topSkills.length > 0 ? (
              analytics.topSkills.map(([skill, count]) => (
                <span
                  key={skill}
                  className="rounded-full border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
                >
                  {skill} • {count}
                </span>
              ))
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Skill distribution appears once your shortlist includes candidates with profile data.
              </p>
            )}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
