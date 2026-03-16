'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import {
  useAddToShortlist,
  useRecruiterStudentProfile,
  useRemoveFromShortlist,
  useShortlist,
} from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type CandidateProfile = {
  id: string;
  fullName: string;
  bio?: string | null;
  degree?: string | null;
  graduationYear?: number | null;
  institution?: { name?: string | null } | null;
  skills?: Array<{ skill?: { name?: string | null } | null }>;
  credentials?: Array<{ id: string; title: string; institution?: { name?: string | null } | null }>;
  projects?: Array<{ id: string; title: string; description?: string | null; repoLink?: string | null }>;
  achievements?: Array<{ id: string; title: string; issuedBy?: string | null }>;
  user?: { publicIdentitySlug?: string | null } | null;
};

type ShortlistEntry = {
  student?: { id?: string | null } | null;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Recruiter';
  return (email.split('@')[0] ?? 'Recruiter')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function CandidateContactPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const profileQuery = useRecruiterStudentProfile(params.id);
  const shortlistQuery = useShortlist();
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'recruiter@educhain.local',
    avatar: null,
  };

  const candidate = profileQuery.data as CandidateProfile | undefined;
  const shortlist = (((shortlistQuery.data as { shortlist?: ShortlistEntry[] } | undefined)?.shortlist) ??
    []) as ShortlistEntry[];
  const isShortlisted = shortlist.some((entry) => entry.student?.id === params.id);

  const suggestedOutreach = useMemo(() => {
    if (!candidate) return '';
    const skills = (candidate.skills ?? [])
      .map((entry) => entry.skill?.name)
      .filter((skill): skill is string => Boolean(skill))
      .slice(0, 3);
    return `Hi ${candidate.fullName},

I’m reaching out because your ${candidate.degree ?? 'academic'} background${
      candidate.institution?.name ? ` at ${candidate.institution.name}` : ''
    } and your strengths in ${skills.join(', ') || 'verified work'} look highly relevant to roles we are hiring for.

If you are open to a conversation, I would love to share more context about the team and the work.

Best,
${layoutUser.name}`;
  }, [candidate, layoutUser.name]);

  useEffect(() => {
    setNote((current) => current || suggestedOutreach);
  }, [suggestedOutreach]);

  if (profileQuery.isLoading || shortlistQuery.isLoading) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <div className="h-80 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </DashboardLayout>
    );
  }

  if (profileQuery.isError || shortlistQuery.isError) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <ErrorState
          title="Candidate view unavailable"
          message="We couldn't load this candidate profile."
          onRetry={() => {
            void profileQuery.refetch();
            void shortlistQuery.refetch();
          }}
        />
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <ErrorState title="Candidate not found" message="The requested candidate could not be found." />
      </DashboardLayout>
    );
  }

  const skills = (candidate.skills ?? [])
    .map((entry) => entry.skill?.name)
    .filter((skill): skill is string => Boolean(skill));

  return (
    <DashboardLayout role="recruiter" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Candidate Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {candidate.fullName}
            </h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              {candidate.institution?.name ?? 'Institution not listed'}
              {candidate.degree ? ` • ${candidate.degree}` : ''}
              {candidate.graduationYear ? ` • ${candidate.graduationYear}` : ''}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              {candidate.bio ?? 'No candidate bio available.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (isShortlisted) {
                  removeFromShortlist.mutate(params.id, {
                    onSuccess: () => setMessage('Candidate removed from shortlist.'),
                  });
                } else {
                  addToShortlist.mutate(
                    { studentId: params.id, note: 'Saved from candidate detail view' },
                    {
                      onSuccess: () => setMessage('Candidate added to shortlist.'),
                    },
                  );
                }
              }}
              disabled={addToShortlist.isPending || removeFromShortlist.isPending}
            >
              {isShortlisted ? 'Remove from Shortlist' : 'Save to Shortlist'}
            </Button>
            <Link href={`/verify/${candidate.id}`}>
              <Button variant="outline">Verify Identity</Button>
            </Link>
            {candidate.user?.publicIdentitySlug && (
              <Link href={`/p/${candidate.user.publicIdentitySlug}`}>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Public Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {message && (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {message}
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Skill Profile
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">No skills listed.</p>
              )}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Credentials
            </p>
            <div className="mt-6 space-y-4">
              {(candidate.credentials ?? []).length > 0 ? (
                candidate.credentials!.map((credential) => (
                  <div
                    key={credential.id}
                    className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                  >
                    <p className="text-lg font-bold text-[var(--text-primary)]">{credential.title}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {credential.institution?.name ?? candidate.institution?.name ?? 'Institution'}
                    </p>
                    <Link
                      href={`/credentials/${credential.id}`}
                      className="mt-3 inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      Open credential
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">No credentials available.</p>
              )}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Outreach Draft
            </p>
            <textarea
              rows={12}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-6 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-3 text-sm text-[var(--text-primary)]"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(note);
                  setMessage('Outreach draft copied to clipboard.');
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Draft
              </Button>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Projects & Achievements
            </p>
            <div className="mt-6 space-y-4">
              {(candidate.projects ?? []).slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                >
                  <p className="text-lg font-bold text-[var(--text-primary)]">{project.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {project.description ?? 'No project summary provided.'}
                  </p>
                </div>
              ))}
              {(candidate.achievements ?? []).slice(0, 2).map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                >
                  <p className="text-lg font-bold text-[var(--text-primary)]">{achievement.title}</p>
                  {achievement.issuedBy && (
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {achievement.issuedBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </DashboardLayout>
  );
}
