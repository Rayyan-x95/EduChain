'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Share2 } from 'lucide-react';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { ErrorState } from '@/components/organisms/ErrorState';
import { VirtualStudentID } from '@/components/organisms/VirtualStudentID';
import { CredentialCard } from '@/components/molecules/CredentialCard';
import { Button } from '@/components/ui/Button';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { useCreateShareLink, useMyCredentials, useStudentProfile } from '@/hooks/api';

type ProfileSkill = { skill?: { name?: string | null } | null };
type CredentialRecord = {
  id: string;
  title: string;
  issuedDate: string | Date;
  status: 'active' | 'revoked';
  signature?: string | null;
  institution?: { name?: string | null } | null;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

function getCredentialStatus(credential: CredentialRecord): 'verified' | 'pending' | 'revoked' {
  if (credential.status === 'revoked') return 'revoked';
  return credential.signature ? 'verified' : 'pending';
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'credentials' | 'activity'>('credentials');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const profileQuery = useStudentProfile();
  const credentialsQuery = useMyCredentials();
  const createShareLink = useCreateShareLink();

  const latestCredentialId = useMemo(() => {
    const credentials = ((credentialsQuery.data as { credentials?: CredentialRecord[] } | undefined)?.credentials) ?? [];
    return credentials[0]?.id ?? null;
  }, [credentialsQuery.data]);

  if (profileQuery.isLoading || credentialsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-5xl p-4 md:p-8">
          <div className="h-[340px] animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  if (profileQuery.isError || credentialsQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-4xl p-6 md:p-10">
          <ErrorState
            title="Wallet unavailable"
            message="We couldn't load your identity wallet right now."
            onRetry={() => {
              void profileQuery.refetch();
              void credentialsQuery.refetch();
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
        institution?: { name?: string | null } | null;
        skills?: ProfileSkill[];
      }
    | undefined;
  const credentials = (((credentialsQuery.data as { credentials?: CredentialRecord[] } | undefined)?.credentials) ??
    []) as CredentialRecord[];

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] pb-24">
        <main id="main-content" className="mx-auto max-w-3xl p-6 md:p-10">
          <ErrorState
            title="Wallet not ready"
            message="Complete your student profile before using the identity wallet."
          />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  const fieldsOfInterest = (profile.skills ?? [])
    .map((entry) => entry.skill?.name)
    .filter((entry): entry is string => Boolean(entry))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      <TopAppBar
        title="Identity Wallet"
        rightAction={
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-5 w-5" />
            </Button>
          </Link>
        }
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main id="main-content" className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
          <VirtualStudentID
            name={profile.fullName}
            institution={profile.institution?.name ?? 'Institution pending'}
            degree={profile.degree ?? 'Student'}
            graduationYear={String(profile.graduationYear ?? 'TBD')}
            studentId={profile.id}
            fieldsOfInterest={fieldsOfInterest}
            institutionVerified={Boolean(profile.institution?.name)}
            credentialVerified={credentials.some((credential) => Boolean(credential.signature))}
          />

          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Wallet Controls
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Portable proof for every opportunity
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Use this wallet to share cryptographically verified credentials, present your virtual
              student ID, and keep your academic identity easy to verify.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                className="gap-2"
                disabled={!latestCredentialId || createShareLink.isPending}
                onClick={async () => {
                  if (!latestCredentialId) return;
                  const response = await createShareLink.mutateAsync({ credentialId: latestCredentialId });
                  setShareUrl((response as { data?: { shareUrl?: string } }).data?.shareUrl ?? null);
                }}
              >
                <Share2 className="h-4 w-4" />
                {createShareLink.isPending ? 'Creating Link...' : 'Share Latest Credential'}
              </Button>
              <Link href={`/verify/${profile.id}`}>
                <Button variant="outline">Open Verification View</Button>
              </Link>
            </div>

            {shareUrl && (
              <div className="mt-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] p-4 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">Credential share link</p>
                <a
                  className="mt-2 block break-all text-[var(--color-primary)] underline-offset-4 hover:underline"
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shareUrl}
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 border-b border-[var(--border-default)] pb-4">
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === 'credentials'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-default)] text-[var(--text-secondary)]'
              }`}
              onClick={() => setActiveTab('credentials')}
            >
              Credentials
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === 'activity'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-default)] text-[var(--text-secondary)]'
              }`}
              onClick={() => setActiveTab('activity')}
            >
              History
            </button>
          </div>

          {activeTab === 'credentials' ? (
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
                  No credentials in the wallet yet.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {credentials.length > 0 ? (
                credentials.map((credential) => (
                  <article
                    key={credential.id}
                    className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      {getCredentialStatus(credential) === 'verified' ? 'Signed and ready' : 'Awaiting signature'}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                      {credential.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {credential.institution?.name ?? profile.institution?.name ?? 'Institution'} · {formatDate(credential.issuedDate)}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                  Activity will appear as your wallet receives verified credentials.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
