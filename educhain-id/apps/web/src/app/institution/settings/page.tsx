'use client';

import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import { useGenerateInstitutionKeys, useInstitutionStats, useRotateInstitutionKeys } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type InstitutionStats = {
  institution?: {
    id: string;
    name?: string | null;
    domain?: string | null;
    verificationStatus?: boolean;
    publicKey?: string | null;
  } | null;
  keyManagement?: {
    hasActiveKey?: boolean;
    activeKeyId?: string | null;
    activeKeyCreatedAt?: string | Date | null;
    keyCount?: number;
  } | null;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Institution Admin';
  return (email.split('@')[0] ?? 'Institution Admin')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function InstitutionSettingsPage() {
  const { user } = useAuth();
  const statsQuery = useInstitutionStats();
  const generateKeys = useGenerateInstitutionKeys();
  const rotateKeys = useRotateInstitutionKeys();
  const [message, setMessage] = useState<string | null>(null);

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'institution@educhain.local',
    avatar: null,
  };

  if (statsQuery.isLoading) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
        <div className="h-80 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </DashboardLayout>
    );
  }

  if (statsQuery.isError) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
        <ErrorState
          title="Institution settings unavailable"
          message="We couldn't load domain and key-management details."
          onRetry={() => void statsQuery.refetch()}
        />
      </DashboardLayout>
    );
  }

  const stats = (statsQuery.data ?? {}) as InstitutionStats;
  const institution = stats.institution;
  const keyManagement = stats.keyManagement;

  return (
    <DashboardLayout role="institution_admin" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Institution Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {institution?.name ?? 'Institution'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Review the institution trust boundary: domain ownership, active signing keys, and the
          controls that make issued credentials durable and verifiable.
        </p>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Domain Trust
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Domain
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {institution?.domain ?? 'Not configured'}
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Verification Status
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {institution?.verificationStatus ? 'Verified institution' : 'Verification pending'}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Institution verification governs whether student records show a strong trust badge in
                public identity views.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--color-primary)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Signing Keys
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Active key
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {keyManagement?.hasActiveKey ? 'Present' : 'Not generated'}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {keyManagement?.activeKeyCreatedAt
                  ? `Current key activated ${formatDate(keyManagement.activeKeyCreatedAt)}.`
                  : 'Generate your first key pair to sign credentials.'}
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Key inventory
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                {keyManagement?.keyCount ?? 0} total key version{(keyManagement?.keyCount ?? 0) === 1 ? '' : 's'}
              </p>
              {institution?.publicKey && (
                <p className="mt-3 break-all font-mono text-xs text-[var(--text-secondary)]">
                  {institution.publicKey.slice(0, 96)}...
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {keyManagement?.hasActiveKey ? (
              <Button
                onClick={() =>
                  institution?.id &&
                  rotateKeys.mutate(institution.id, {
                    onSuccess: () => setMessage('Institution keys rotated successfully.'),
                  })
                }
                disabled={!institution?.id || rotateKeys.isPending}
              >
                {rotateKeys.isPending ? 'Rotating...' : 'Rotate Keys'}
              </Button>
            ) : (
              <Button
                onClick={() =>
                  institution?.id &&
                  generateKeys.mutate(institution.id, {
                    onSuccess: () => setMessage('Institution key pair generated successfully.'),
                  })
                }
                disabled={!institution?.id || generateKeys.isPending}
              >
                {generateKeys.isPending ? 'Generating...' : 'Generate Keys'}
              </Button>
            )}
          </div>

          {message && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              {message}
            </div>
          )}
        </article>
      </section>
    </DashboardLayout>
  );
}
