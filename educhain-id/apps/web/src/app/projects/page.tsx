'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { useMyProjects } from '@/hooks/api';

type ProjectRecord = {
  id: string;
  title: string;
  description?: string | null;
  repoLink?: string | null;
  createdAt: string | Date;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function ProjectsPage() {
  const router = useRouter();
  const projectsQuery = useMyProjects();

  if (projectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <TopAppBar
          title="Projects"
          showBack={true}
          onBack={() => router.back()}
          className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
        />
        <main className="mx-auto max-w-5xl p-4 md:p-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
              />
            ))}
          </div>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  if (projectsQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <TopAppBar
          title="Projects"
          showBack={true}
          onBack={() => router.back()}
          className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
        />
        <main className="mx-auto max-w-4xl p-6 md:p-10">
          <ErrorState
            title="Projects unavailable"
            message="We couldn't load your project portfolio right now."
            onRetry={() => void projectsQuery.refetch()}
          />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const projects = (Array.isArray(projectsQuery.data) ? projectsQuery.data : []) as ProjectRecord[];

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <TopAppBar
        title="Projects"
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <button
            type="button"
            onClick={() => router.push('/projects/new')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-500"
            aria-label="Add project"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Portfolio Signal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Showcase work that reinforces your verified identity
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Projects give institutions and recruiters more context than credentials alone. Link to the
            repository when possible so reviewers can inspect real work.
          </p>
        </section>

        {projects.length === 0 ? (
          <section className="mt-6 rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">No projects published yet</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Add at least one project to strengthen your profile, collaboration invitations, and recruiter
              discovery ranking.
            </p>
            <button
              type="button"
              onClick={() => router.push('/projects/new')}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create your first project
            </button>
          </section>
        ) : (
          <section className="mt-6 grid gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                      {project.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                      {project.description?.trim() || 'No project description provided yet.'}
                    </p>
                  </div>
                  {project.repoLink ? (
                    <a
                      href={project.repoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-blue-200 hover:text-blue-600"
                    >
                      Open repository
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                    Added {formatDate(project.createdAt)}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
