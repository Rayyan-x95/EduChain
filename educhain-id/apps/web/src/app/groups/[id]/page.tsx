'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useGroupById } from '@/hooks/api';

type GroupRecord = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | Date;
  myRole?: 'owner' | 'member';
  creator?: { id: string; fullName?: string | null } | null;
  members?: Array<{
    studentId?: string;
    role?: 'owner' | 'member';
    student?: {
      id?: string;
      fullName?: string | null;
      degree?: string | null;
      institution?: { name?: string | null } | null;
    } | null;
  }>;
};

function formatDate(value?: string | Date) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const groupQuery = useGroupById(params.id);
  const group = groupQuery.data as GroupRecord | undefined;

  if (groupQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto h-80 max-w-5xl animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </div>
    );
  }

  if (groupQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Group unavailable"
            message="We couldn't load this group detail right now."
            onRetry={() => void groupQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState title="Group not found" message="This collaboration group could not be found." />
        </div>
      </div>
    );
  }

  const members = group.members ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <TopAppBar
        title="Group Detail"
        showBack
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                  {group.myRole ?? 'member'}
                </span>
                <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {members.length} members
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                {group.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                {group.description ?? 'No group description has been added yet.'}
              </p>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Created by {group.creator?.fullName ?? 'Unknown owner'} • {formatDate(group.createdAt)}
              </p>
            </div>

            <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <div className="flex items-center gap-2 text-[var(--color-primary)]">
                <Users className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Collaboration</p>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
                Use collaboration requests and project links to coordinate work. Group posts are not
                modeled yet, so the source of truth here is membership and linked project activity.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Members
            </p>
            <div className="mt-6 space-y-4">
              {members.map((member) => (
                <div
                  key={member.student?.id ?? member.studentId}
                  className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                          {member.student?.fullName ?? 'Unknown member'}
                        </p>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                          {member.role ?? 'member'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {member.student?.institution?.name ?? 'Institution not listed'}
                        {member.student?.degree ? ` • ${member.student.degree}` : ''}
                      </p>
                    </div>

                    {member.student?.id && (
                      <Link href={`/verify/${member.student.id}`}>
                        <Button variant="outline">Verify Identity</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Next Steps
            </p>
            <div className="mt-6 space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
              <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
                Connect this group to active projects so recruiters and collaborators can understand
                what the team is actually shipping.
              </div>
              <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
                Use direct collaboration requests to bring in more verified peers before expanding the
                group membership.
              </div>
              <Link href="/groups" className="block rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5 font-semibold text-[var(--color-primary)]">
                Return to groups directory
              </Link>
            </div>
          </article>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
