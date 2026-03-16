'use client';

import Link from 'next/link';
import { Bell, ChevronRight, Sparkles, Users } from 'lucide-react';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { VirtualStudentID } from '@/components/organisms/VirtualStudentID';
import { CredentialCard } from '@/components/molecules/CredentialCard';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { Button } from '@/components/ui/Button';
import {
  useMyCredentials,
  useMyProjects,
  useProfileCompletion,
  useStudentProfile,
  useStudentStats,
} from '@/hooks/api';

type ProfileSkill = { skill?: { name?: string | null } | null };
type CredentialRecord = {
  id: string;
  title: string;
  credentialType: string;
  issuedDate: string | Date;
  status: 'active' | 'revoked';
  signature?: string | null;
  institution?: { name?: string | null } | null;
};
type ProjectRecord = {
  id: string;
  title: string;
  description?: string | null;
  repoLink?: string | null;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

function getCredentialStatus(credential: CredentialRecord): 'verified' | 'pending' | 'revoked' {
  if (credential.status === 'revoked') {
    return 'revoked';
  }

  return credential.signature ? 'verified' : 'pending';
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <main id="main-content" className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/80" />
        <div className="h-[320px] animate-pulse rounded-[28px] bg-slate-200/60 dark:bg-slate-900/80" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl bg-slate-200/60 dark:bg-slate-900/80"
            />
          ))}
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}

export default function StudentDashboardPage() {
  const profileQuery = useStudentProfile();
  const statsQuery = useStudentStats();
  const credentialsQuery = useMyCredentials();
  const projectsQuery = useMyProjects();
  const completionQuery = useProfileCompletion();

  if (
    profileQuery.isLoading ||
    statsQuery.isLoading ||
    credentialsQuery.isLoading ||
    projectsQuery.isLoading
  ) {
    return <DashboardSkeleton />;
  }

  if (profileQuery.isError || statsQuery.isError || credentialsQuery.isError || projectsQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-4xl p-6 md:p-10">
          <ErrorState
            title="Dashboard unavailable"
            message="We couldn't load your identity dashboard right now."
            onRetry={() => {
              void profileQuery.refetch();
              void statsQuery.refetch();
              void credentialsQuery.refetch();
              void projectsQuery.refetch();
            }}
          />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const profile = profileQuery.data as
    | {
        id: string;
        fullName: string;
        degree?: string | null;
        graduationYear?: number | null;
        bio?: string | null;
        institution?: { name?: string | null } | null;
        skills?: ProfileSkill[];
      }
    | undefined;

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto flex max-w-2xl flex-col gap-6 p-6 md:p-10">
          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Setup Required
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
              Finish your student identity
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Your dashboard will start showing verified credentials, collaboration signals, and your
              public identity card as soon as your student profile is complete.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/onboarding/profile">
                <Button>Complete Profile</Button>
              </Link>
              <Link href="/auth/select-institution">
                <Button variant="outline">Choose Institution</Button>
              </Link>
            </div>
          </div>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const studentStats = (statsQuery.data ?? {}) as {
    credentialCount?: number;
    projectCount?: number;
    collaboratorCount?: number;
    groupCount?: number;
    institutionVerified?: boolean;
  };
  const credentials = (((credentialsQuery.data as { credentials?: CredentialRecord[] } | undefined)?.credentials) ??
    []) as CredentialRecord[];
  const projects = (Array.isArray(projectsQuery.data) ? projectsQuery.data : []) as ProjectRecord[];
  const completion = (completionQuery.data ?? { score: 0, missing: [] }) as {
    score?: number;
    missing?: string[];
  };
  const skills = (profile.skills ?? [])
    .map((entry) => entry.skill?.name)
    .filter((entry): entry is string => Boolean(entry))
    .slice(0, 4);

  const statCards = [
    {
      label: 'Verified Credentials',
      value: studentStats.credentialCount ?? credentials.length,
      hint: 'Institution-issued and cryptographically signed',
      tone: 'from-blue-600/15 to-cyan-500/10 text-blue-700 dark:text-blue-300',
    },
    {
      label: 'Projects',
      value: studentStats.projectCount ?? projects.length,
      hint: 'Portfolio work visible to collaborators and recruiters',
      tone: 'from-emerald-500/15 to-green-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Collaborators',
      value: studentStats.collaboratorCount ?? 0,
      hint: 'Accepted collaboration relationships',
      tone: 'from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Profile Completion',
      value: `${completion.score ?? 0}%`,
      hint:
        completion.missing?.length
          ? `Missing: ${completion.missing.slice(0, 2).join(', ')}`
          : 'Ready for talent discovery',
      tone: 'from-fuchsia-500/15 to-pink-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <main id="main-content" className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8">
        <header className="flex flex-col gap-4 rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Verified Student Identity
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {profile.fullName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {profile.institution?.name ?? 'Institution pending verification'}
              {profile.degree ? ` · ${profile.degree}` : ''}
              {profile.graduationYear ? ` · Class of ${profile.graduationYear}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/groups#requests">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Requests
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" aria-label="View notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
          <VirtualStudentID
            name={profile.fullName}
            institution={profile.institution?.name ?? 'Institution pending'}
            degree={profile.degree ?? 'Student'}
            graduationYear={String(profile.graduationYear ?? 'TBD')}
            studentId={profile.id}
            fieldsOfInterest={skills}
            institutionVerified={studentStats.institutionVerified ?? false}
            credentialVerified={(studentStats.credentialCount ?? credentials.length) > 0}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {statCards.map((card) => (
              <article
                key={card.label}
                className={`rounded-[28px] border border-[var(--border-default)] bg-gradient-to-br ${card.tone} p-5 shadow-sm`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-current/75">
                  {card.label}
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.hint}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Credentials
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  Trusted proof of academic identity
                </h2>
              </div>
              <Link href="/credentials" className="text-sm font-semibold text-[var(--color-primary)]">
                View All
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {credentials.length > 0 ? (
                credentials.slice(0, 3).map((credential) => (
                  <CredentialCard
                    key={credential.id}
                    title={credential.title}
                    institution={credential.institution?.name ?? profile.institution?.name ?? 'Institution'}
                    issueDate={formatDate(credential.issuedDate)}
                    status={getCredentialStatus(credential)}
                    onViewDetails={() => {
                      window.location.href = `/credentials/${credential.id}`;
                    }}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-6 text-sm text-[var(--text-secondary)]">
                  No credentials have been issued yet. Once your institution signs your records, they will
                  appear here with verification status and export options.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Projects
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  Proof of execution
                </h2>
              </div>
              <Link href="/projects" className="text-sm font-semibold text-[var(--color-primary)]">
                Open Projects
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.description ?? 'No project summary added yet.'}
                    techStack={project.repoLink ? ['Repository linked'] : []}
                    memberCount={1}
                    status="active"
                    onClick={() => {
                      window.location.href = '/projects';
                    }}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-6 text-sm text-[var(--text-secondary)]">
                  Add at least one project to strengthen your identity profile for institutions,
                  collaborators, and recruiters.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Next Best Actions
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                Increase trust and discoverability
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/profile">
                <Button variant="outline" className="gap-2">
                  Complete Profile
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/groups">
                <Button className="gap-2">
                  Join Groups
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
