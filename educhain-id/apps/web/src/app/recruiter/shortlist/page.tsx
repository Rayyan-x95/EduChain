'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import { useRemoveFromShortlist, useShortlist } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type ShortlistEntry = {
  note?: string | null;
  student?: {
    id: string;
    fullName?: string | null;
    degree?: string | null;
    graduationYear?: number | null;
    institution?: { name?: string | null } | null;
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

export default function RecruiterShortlistPage() {
  const { user } = useAuth();
  const shortlistQuery = useShortlist();
  const removeMutation = useRemoveFromShortlist();

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'recruiter@educhain.local',
    avatar: null,
  };

  const shortlist = (((shortlistQuery.data as { shortlist?: ShortlistEntry[] } | undefined)?.shortlist) ??
    []) as ShortlistEntry[];

  return (
    <DashboardLayout role="recruiter" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Shortlist
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Candidates worth following up
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Keep the students whose credentials and project record match the roles you are actively
          hiring for.
        </p>
      </section>

      {shortlistQuery.isLoading ? (
        <section className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
            />
          ))}
        </section>
      ) : shortlistQuery.isError ? (
        <section className="mt-6">
          <ErrorState
            title="Shortlist unavailable"
            message="We couldn't load your saved candidates."
            onRetry={() => void shortlistQuery.refetch()}
          />
        </section>
      ) : (
        <section className="mt-6 space-y-4">
          {shortlist.length > 0 ? (
            shortlist.map((entry) => {
              const student = entry.student;
              const skills = (student?.skills ?? [])
                .map((skill) => skill.skill?.name)
                .filter((skill): skill is string => Boolean(skill));

              return (
                <article
                  key={student?.id ?? 'unknown'}
                  className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {student?.fullName ?? 'Unknown student'}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {student?.institution?.name ?? 'Institution not listed'}
                        {student?.degree ? ` · ${student.degree}` : ''}
                        {student?.graduationYear ? ` · ${student.graduationYear}` : ''}
                      </p>

                      {skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.note && (
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                          {entry.note}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {student?.id && (
                        <Link href={`/recruiter/contact/${student.id}`}>
                          <Button>Message Candidate</Button>
                        </Link>
                      )}
                      {student?.id && (
                        <Button
                          variant="outline"
                          disabled={removeMutation.isPending}
                          onClick={() => removeMutation.mutate(student.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
              No candidates shortlisted yet. Start from the discover screen and save students with
              strong trust signals.
            </div>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}
