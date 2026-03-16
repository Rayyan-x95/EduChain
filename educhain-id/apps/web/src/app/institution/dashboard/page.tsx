'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useInstitutionCredentials, useInstitutionStats } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type InstitutionStats = {
  institution?: { name?: string | null; domain?: string | null } | null;
  studentCount?: number;
  credentialCount?: number;
  signedCredentialCount?: number;
  pendingRequests?: number;
  approvedRequests?: number;
  verificationRate?: number;
};

type CredentialRecord = {
  id: string;
  title: string;
  credentialType: string;
  issuedDate: string | Date;
  student?: { fullName?: string | null } | null;
  status: 'active' | 'revoked';
  signature?: string | null;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Institution Admin';
  const local = email.split('@')[0] ?? 'Institution Admin';
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const statsQuery = useInstitutionStats();
  const credentialsQuery = useInstitutionCredentials();

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'institution@educhain.local',
    avatar: null,
  };

  if (statsQuery.isLoading || credentialsQuery.isLoading) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
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

  if (statsQuery.isError || credentialsQuery.isError) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
        <ErrorState
          title="Institution dashboard unavailable"
          message="We couldn't load the institution analytics and credential queue."
          onRetry={() => {
            void statsQuery.refetch();
            void credentialsQuery.refetch();
          }}
        />
      </DashboardLayout>
    );
  }

  const stats = (statsQuery.data ?? {}) as InstitutionStats;
  const credentials = (((credentialsQuery.data as { credentials?: CredentialRecord[] } | undefined)?.credentials) ??
    []) as CredentialRecord[];
  const metricCards = [
    {
      label: 'Verified Students',
      value: stats.studentCount ?? 0,
      hint: 'Profiles linked to your institution',
    },
    {
      label: 'Credentials Issued',
      value: stats.credentialCount ?? 0,
      hint: `${stats.signedCredentialCount ?? 0} signed and verifiable`,
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests ?? 0,
      hint: 'Students waiting for verification review',
    },
    {
      label: 'Verification Rate',
      value: `${stats.verificationRate ?? 0}%`,
      hint: `${stats.approvedRequests ?? 0} approved requests`,
    },
  ];

  return (
    <DashboardLayout role="institution_admin" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Institution Control Plane
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {stats.institution?.name ?? 'Institution Dashboard'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Monitor trust signals across student verification, credential issuance, and signing
          throughput from a single operational surface.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/institution/issue" className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
            Issue Credential
          </Link>
          <Link href="/institution/requests" className="rounded-xl border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
            Review Requests
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              {card.label}
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              {card.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Recent Credentials
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              Latest records issued by your institution
            </h2>
          </div>
          <Link href="/institution/issue" className="text-sm font-semibold text-[var(--color-primary)]">
            Create New
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              <tr>
                <th className="pb-4 font-semibold">Student</th>
                <th className="pb-4 font-semibold">Credential</th>
                <th className="pb-4 font-semibold">Issued</th>
                <th className="pb-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {credentials.length > 0 ? (
                credentials.slice(0, 8).map((credential) => (
                  <tr key={credential.id}>
                    <td className="py-4 text-[var(--text-primary)]">
                      {credential.student?.fullName ?? 'Unknown Student'}
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-[var(--text-primary)]">{credential.title}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{credential.credentialType}</div>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)]">{formatDate(credential.issuedDate)}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
                        {credential.status === 'revoked'
                          ? 'Revoked'
                          : credential.signature
                            ? 'Signed'
                            : 'Pending signature'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-sm text-[var(--text-secondary)]">
                    No credentials have been issued yet. Use the issue flow to create your first signed
                    academic record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
