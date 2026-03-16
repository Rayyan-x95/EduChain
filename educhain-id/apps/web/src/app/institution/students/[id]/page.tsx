'use client';

import Link from 'next/link';
import { useMemo } from 'react';
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
  updatedAt?: string | Date;
  status: 'pending' | 'approved' | 'rejected';
  student?: { id?: string; fullName?: string | null } | null;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Institution Admin';
  return (email.split('@')[0] ?? 'Institution Admin')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value?: string | Date) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function StudentVerificationDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const requestsQuery = useInstitutionVerifications();
  const reviewMutation = useReviewVerification();

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'institution@educhain.local',
    avatar: null,
  };

  const requests = useMemo(
    () =>
      ((((requestsQuery.data as { requests?: VerificationRequest[] } | undefined)?.requests) ??
        []) as VerificationRequest[]),
    [requestsQuery.data],
  );
  const request = useMemo(
    () => requests.find((entry) => entry.id === params.id),
    [params.id, requests],
  );

  if (requestsQuery.isLoading) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
        <div className="h-80 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </DashboardLayout>
    );
  }

  if (requestsQuery.isError) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
        <ErrorState
          title="Verification request unavailable"
          message="We couldn't load this review request."
          onRetry={() => void requestsQuery.refetch()}
        />
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout role="institution_admin" user={layoutUser}>
        <ErrorState title="Request not found" message="This verification request could not be found." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="institution_admin" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Verification Review
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {request.student?.fullName ?? 'Unknown student'}
            </h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Submitted {formatDate(request.createdAt)} • Status {request.status}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/institution/requests">
              <Button variant="outline">Back to Queue</Button>
            </Link>
            {request.status === 'pending' && (
              <>
                <Button
                  disabled={reviewMutation.isPending}
                  onClick={() =>
                    reviewMutation.mutate({
                      verificationId: request.id,
                      decision: 'approved',
                    })
                  }
                >
                  Approve Request
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
                  Reject Request
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Identity Evidence
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Student email
              </p>
              <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">{request.studentEmail}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Student ID number
              </p>
              <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
                {request.studentIdNumber}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Submitted
              </p>
              <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
                {formatDate(request.createdAt)}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                Last updated
              </p>
              <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
                {formatDate(request.updatedAt)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Review Guidance
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
              Confirm that the email domain and the student ID number align with your registrar or
              admissions records before approval.
            </div>
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
              Approval links the student profile to your institution and unlocks stronger
              institution-backed trust signals across the platform.
            </div>
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
              Reject if any field conflicts with internal records or if the request appears
              duplicated or fraudulent.
            </div>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
