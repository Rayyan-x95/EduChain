'use client';

import Link from 'next/link';
import { Settings, Share2 } from 'lucide-react';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { CredentialCard } from '@/components/molecules/CredentialCard';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { Button } from '@/components/ui/Button';
import { TopAppBar } from '@/components/ui/TopAppBar';
import {
  useMyAchievements,
  useMyCredentials,
  useMyProjects,
  useStudentProfile,
} from '@/hooks/api';

type ProfileSkill = { skill?: { name?: string | null } | null };
type CredentialRecord = {
  id: string;
  title: string;
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
type AchievementRecord = {
  id: string;
  title: string;
  description?: string | null;
  issuedBy?: string | null;
  date?: string | Date | null;
};

function formatDate(value?: string | Date | null) {
  if (!value) return 'Date not provided';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));
}

function getCredentialStatus(credential: CredentialRecord): 'verified' | 'pending' | 'revoked' {
  if (credential.status === 'revoked') return 'revoked';
  return credential.signature ? 'verified' : 'pending';
}

export default function StudentProfilePage() {
  const profileQuery = useStudentProfile();
  const credentialsQuery = useMyCredentials();
  const projectsQuery = useMyProjects();
  const achievementsQuery = useMyAchievements();

  if (profileQuery.isLoading || credentialsQuery.isLoading || projectsQuery.isLoading || achievementsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-5xl p-4 md:p-8">
          <div className="h-80 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  if (profileQuery.isError || credentialsQuery.isError || projectsQuery.isError || achievementsQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-4xl p-6 md:p-10">
          <ErrorState
            title="Profile unavailable"
            message="We couldn't load your identity profile right now."
            onRetry={() => {
              void profileQuery.refetch();
              void credentialsQuery.refetch();
              void projectsQuery.refetch();
              void achievementsQuery.refetch();
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
        bio?: string | null;
        degree?: string | null;
        graduationYear?: number | null;
        institution?: { name?: string | null } | null;
        user?: { publicIdentitySlug?: string | null } | null;
        skills?: ProfileSkill[];
      }
    | undefined;

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-3xl p-6 md:p-10">
          <ErrorState
            title="Profile not found"
            message="Create your student profile to unlock your public identity page."
          />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const skills = (profile.skills ?? [])
    .map((entry) => entry.skill?.name)
    .filter((entry): entry is string => Boolean(entry));
  const credentials = (((credentialsQuery.data as { credentials?: CredentialRecord[] } | undefined)?.credentials) ??
    []) as CredentialRecord[];
  const projects = (Array.isArray(projectsQuery.data) ? projectsQuery.data : []) as ProjectRecord[];
  const achievements = (Array.isArray(achievementsQuery.data) ? achievementsQuery.data : []) as AchievementRecord[];
  const publicProfileUrl = profile.user?.publicIdentitySlug ? `/p/${profile.user.publicIdentitySlug}` : null;

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <TopAppBar
        title="Profile"
        rightAction={
          <Link href="/settings">
            <Button variant="ghost" size="icon" aria-label="Open settings">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        }
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main id="main-content" className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Verified Student Profile
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {profile.fullName}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {profile.institution?.name ?? 'Institution pending verification'}
                {profile.degree ? ` · ${profile.degree}` : ''}
                {profile.graduationYear ? ` · Class of ${profile.graduationYear}` : ''}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                {profile.bio ?? 'Add a short bio to explain your interests, goals, and proof points.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/onboarding/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              {publicProfileUrl && (
                <Link href={publicProfileUrl}>
                  <Button className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Public Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--text-secondary)]">No skills added yet.</span>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Credentials
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                  Trust signals for recruiters and institutions
                </h2>
              </div>
              <Link href="/credentials" className="text-sm font-semibold text-[var(--color-primary)]">
                View All
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {credentials.length > 0 ? (
                credentials.map((credential) => (
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
                <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                  Credentials will appear here as soon as your institution issues and signs them.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    Projects
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    Work that supports your identity
                  </h2>
                </div>
                <Link href="/projects" className="text-sm font-semibold text-[var(--color-primary)]">
                  Manage
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {projects.length > 0 ? (
                  projects.slice(0, 3).map((project) => (
                    <ProjectCard
                      key={project.id}
                      title={project.title}
                      description={project.description ?? 'No project summary provided.'}
                      techStack={project.repoLink ? ['Repository linked'] : []}
                      memberCount={1}
                      status="active"
                      onClick={() => {
                        window.location.href = '/projects';
                      }}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                    Add projects to make your profile easier to trust and easier to hire from.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Achievements
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                Highlights worth verifying
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {achievements.length > 0 ? (
                  achievements.slice(0, 4).map((achievement) => (
                    <Link
                      key={achievement.id}
                      href={`/achievements/${achievement.id}`}
                      className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                        {formatDate(achievement.date)}
                      </p>
                      <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">
                        {achievement.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {achievement.description ?? 'No description provided.'}
                      </p>
                      {achievement.issuedBy && (
                        <p className="mt-3 text-xs font-medium text-[var(--text-tertiary)]">
                          Issued by {achievement.issuedBy}
                        </p>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)] sm:col-span-2">
                    Achievements help explain your journey beyond formal credentials. Add hackathons,
                    awards, and certifications to complete the story.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
