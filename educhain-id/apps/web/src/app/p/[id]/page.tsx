'use client';

import { useState } from 'react';
import { Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/organisms/ErrorState';
import { usePublicIdentity } from '@/hooks/api';

type PublicProfile = {
  fullName: string;
  slug: string;
  username?: string | null;
  bio?: string | null;
  institution?: string | null;
  institutionVerified?: boolean;
  degree?: string | null;
  graduationYear?: number | null;
  skills: string[];
  verifiedCredentialCount: number;
  endorsementCount: number;
  relationshipCount: number;
  credentials?: Array<{
    id: string;
    title: string;
    credentialType: string;
    issuedDate: string | Date;
    institutionName: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description?: string | null;
    repoLink?: string | null;
    createdAt: string | Date;
  }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/api/v1';

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const publicProfileQuery = usePublicIdentity(params.id);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  if (publicProfileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <TopAppBar
          title="Public Profile"
          className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90"
        />
        <main className="mx-auto max-w-5xl p-4 md:p-8">
          <div className="animate-pulse rounded-[32px] bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-6 h-8 w-56 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (publicProfileQuery.isError || !publicProfileQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <TopAppBar
          title="Public Profile"
          className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90"
        />
        <main className="mx-auto max-w-4xl p-6 md:p-10">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <ErrorState
              title="Public profile unavailable"
              message="This public identity is private, missing, or no longer available."
              onRetry={() => void publicProfileQuery.refetch()}
            />
          </div>
        </main>
      </div>
    );
  }

  const profile = publicProfileQuery.data as PublicProfile;
  const credentials = profile.credentials ?? [];
  const projects = profile.projects ?? [];
  const initials = profile.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const didUrl = `${API_BASE}/identity/${profile.slug}/did.json`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <TopAppBar
        title="Public Profile"
        className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90"
        rightAction={
          <Button variant="ghost" size="icon" onClick={handleCopyLink} aria-label="Copy profile link">
            <Copy className="h-4 w-4" />
          </Button>
        }
      />

      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="relative overflow-hidden px-6 py-8 md:px-10 md:py-10">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 opacity-95" />
            <div className="absolute inset-x-0 top-24 h-40 bg-white/90 blur-3xl dark:bg-slate-900/70" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/40 bg-slate-900 text-3xl font-bold text-white shadow-2xl dark:bg-slate-950">
                  {initials}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {profile.verifiedCredentialCount > 0 || profile.institutionVerified
                      ? 'Verified academic identity'
                      : 'Public identity'}
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                    {profile.fullName}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {profile.degree
                      ? `${profile.degree}${profile.graduationYear ? ` - Class of ${profile.graduationYear}` : ''}`
                      : 'Student identity'}
                    {profile.institution ? ` - ${profile.institution}` : ''}
                  </p>
                  {profile.username ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      @{profile.username}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={didUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-900 dark:hover:text-blue-400"
                >
                  DID document
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {copyState === 'copied' ? 'Link copied' : copyState === 'failed' ? 'Copy failed' : 'Copy link'}
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 px-6 py-6 md:grid-cols-3 md:px-10 dark:border-slate-800">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Verified Credentials</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{profile.verifiedCredentialCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Endorsements</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{profile.endorsementCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Network Relationships</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{profile.relationshipCount}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Identity summary</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {profile.bio?.trim()
                  ? profile.bio
                  : 'This learner has chosen to keep their public profile concise. Verified credentials and project work appear below.'}
              </p>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Verified credentials</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{credentials.length} published</p>
              </div>
              <div className="mt-4 space-y-3">
                {credentials.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No public credentials have been published for this identity yet.
                  </div>
                ) : (
                  credentials.map((credential) => (
                    <div key={credential.id} className="rounded-2xl border border-slate-200 px-5 py-4 dark:border-slate-800">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{credential.title}</h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {credential.institutionName} - {credential.credentialType}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      </div>
                      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Issued {formatDate(credential.issuedDate)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Skill graph</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No public skills listed yet.
                  </div>
                ) : (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Featured projects</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{projects.length} showcased</p>
              </div>
              <div className="mt-4 space-y-3">
                {projects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No public project work has been added yet.
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="rounded-2xl border border-slate-200 px-5 py-4 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {project.description?.trim() || 'Project description not provided.'}
                          </p>
                        </div>
                        {project.repoLink ? (
                          <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-blue-900 dark:hover:text-blue-400"
                            aria-label={`Open repository for ${project.title}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Added {formatDate(project.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
