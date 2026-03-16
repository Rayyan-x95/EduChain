'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useCollaborationRequests,
  useCreateGroup,
  useHandleCollaboration,
  useMyGroups,
} from '@/hooks/api';

type GroupRecord = {
  id: string;
  name: string;
  description?: string | null;
  myRole?: 'owner' | 'member';
  _count?: { members?: number };
  members?: Array<{ student?: { fullName?: string | null } | null }>;
};

export default function GroupsDirectoryPage() {
  const groupsQuery = useMyGroups();
  const incomingQuery = useCollaborationRequests('incoming');
  const outgoingQuery = useCollaborationRequests('outgoing');
  const handleMutation = useHandleCollaboration();
  const createGroup = useCreateGroup();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createGroup.mutateAsync({
      name,
      description: description.trim() || undefined,
    });
    setName('');
    setDescription('');
  }

  const groups = (Array.isArray(groupsQuery.data) ? groupsQuery.data : []) as GroupRecord[];
  const incoming = (Array.isArray(incomingQuery.data) ? incomingQuery.data : []) as Array<{
    id: string;
    message?: string | null;
    sender?: { fullName?: string | null } | null;
  }>;
  const outgoing = (Array.isArray(outgoingQuery.data) ? outgoingQuery.data : []) as Array<{
    id: string;
    message?: string | null;
    receiver?: { fullName?: string | null } | null;
  }>;

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <main id="main-content" className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Project Groups
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Build alongside verified peers
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                Use groups to organize collaborative work, keep ownership clear, and surface trustworthy
                team activity on top of your academic identity.
              </p>
            </div>

            <Link href="/groups#requests">
              <Button variant="outline">Open Collaboration Requests</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form
            className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
            onSubmit={handleCreateGroup}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Create Group
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Start a new working circle</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                  Group Name
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Zero-Knowledge Builders"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What are you building, researching, or sharing together?"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <Button type="submit" disabled={createGroup.isPending}>
                {createGroup.isPending ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            {groupsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
                />
              ))
            ) : groupsQuery.isError ? (
              <ErrorState
                title="Groups unavailable"
                message="We couldn't load your groups right now."
                onRetry={() => void groupsQuery.refetch()}
              />
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <article
                  key={group.id}
                  className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                          {group.myRole ?? 'member'}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {group._count?.members ?? group.members?.length ?? 0} members
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">{group.name}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                        {group.description ?? 'No group description yet.'}
                      </p>
                    </div>

                    <Link href={`/groups/${group.id}`}>
                      <Button variant="outline">Open Group</Button>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
                You are not part of any groups yet. Create one to organize a project or study cohort.
              </div>
            )}
          </div>
        </section>

        <section id="requests" className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Incoming Requests
            </p>
            <div className="mt-6 space-y-4">
              {incomingQuery.isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
                  />
                ))
              ) : incoming.length > 0 ? (
                incoming.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                  >
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {request.sender?.fullName ?? 'Unknown sender'}
                    </h2>
                    {request.message && (
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {request.message}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        disabled={handleMutation.isPending}
                        onClick={() => handleMutation.mutate({ id: request.id, decision: 'accepted' })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        disabled={handleMutation.isPending}
                        onClick={() => handleMutation.mutate({ id: request.id, decision: 'rejected' })}
                      >
                        Decline
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                  No incoming requests right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Outgoing Requests
            </p>
            <div className="mt-6 space-y-4">
              {outgoingQuery.isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
                  />
                ))
              ) : outgoing.length > 0 ? (
                outgoing.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                  >
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {request.receiver?.fullName ?? 'Unknown recipient'}
                    </h2>
                    {request.message && (
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {request.message}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                  No outgoing requests right now.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
