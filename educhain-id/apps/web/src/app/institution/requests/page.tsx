'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import { useInstitutionVerifications, useReviewVerification } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type VerificationRequest = {
  id: string;
  studentEmail: string;
  studentIdNumber: string;
  createdAt: string | Date;
  status: 'pending' | 'approved' | 'rejected';
  student?: { fullName?: string | null } | null;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Institution Admin';
  return (email.split('@')[0] ?? 'Institution Admin')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function VerificationRequestsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>('pending');
  const verificationQuery = useInstitutionVerifications(status);
  const reviewMutation = useReviewVerification();

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'institution@educhain.local',
    avatar: null,
  };

  const requests = useMemo(
    () => (((verificationQuery.data as { requests?: VerificationRequest[] } | undefined)?.requests) ?? []) as VerificationRequest[],
    [verificationQuery.data],
  );

  return (
    <DashboardLayout role="institution_admin" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Verification Queue
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Review student trust requests
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Approve requests only after the student identity and institution-linked evidence line up.
          These decisions directly affect discoverability and issuance eligibility.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {(['pending', 'approved', 'rejected'] as const).map((value) => (
            <button
              key={value}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                status === value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-default)] text-[var(--text-secondary)]'
              }`}
              onClick={() => setStatus(value)}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {verificationQuery.isLoading ? (
        <section className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
            />
          ))}
        </section>
      ) : verificationQuery.isError ? (
        <section className="mt-6">
          <ErrorState
            title="Verification queue unavailable"
            message="We couldn't load the current institution requests."
            onRetry={() => void verificationQuery.refetch()}
          />
        </section>
      ) : (
        <section className="mt-6 space-y-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <article
                key={request.id}
                className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                        {request.status}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Submitted {formatDate(request.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                      {request.student?.fullName ?? 'Unnamed student'}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{request.studentEmail}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Student ID: {request.studentIdNumber}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/institution/students/${request.id}`}>
                        <Button variant="outline">Open Review</Button>
                      </Link>
                      <Button
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({
                            verificationId: request.id,
                            decision: 'approved',
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({
                            verificationId: request.id,
                            decision: 'rejected',
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
              No requests in the {status ?? 'current'} queue.
            </div>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}
