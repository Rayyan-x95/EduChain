'use client';

import Link from 'next/link';
import { ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useVerifyStudentIdentity } from '@/hooks/api';

type VerificationPayload = {
  verified: boolean;
  verifiedAt: string;
  identity?: {
    fullName: string;
    institution?: string | null;
    degree?: string | null;
    graduationYear?: number | null;
    slug?: string | null;
    skills?: string[];
    verifiedCredentialCount?: number;
    endorsementCount?: number;
    relationshipCount?: number;
  };
  credentials?: Array<{
    id: string;
    title: string;
    credentialType: string;
    issuedDate: string | Date;
    status: 'active' | 'revoked';
    institutionName: string;
    signatureValid: boolean;
  }>;
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function VerifyItemPage({ params }: { params: { id: string } }) {
  const verificationQuery = useVerifyStudentIdentity(params.id);

  if (verificationQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">EduChain Verify</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Resolving identity signature</p>
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10">
          <div className="w-full animate-pulse rounded-[28px] bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mx-auto mt-6 h-7 w-64 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mx-auto mt-3 h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (verificationQuery.isError || !verificationQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">EduChain Verify</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Identity record unavailable</p>
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-10">
          <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <ErrorState
              title="Verification failed"
              message="We couldn't find a public verified student identity for this EduChain ID."
              onRetry={() => void verificationQuery.refetch()}
            />
            <div className="mt-6 flex justify-center">
              <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
                Return to EduChain home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const result = verificationQuery.data as VerificationPayload;
  const identity = result.identity;
  const credentials = result.credentials ?? [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Verified Identity</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last checked {formatDate(result.verifiedAt)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-10">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-2xl font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {identity?.fullName
                  ?.split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() ?? 'ID'}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Signature verified
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {identity?.fullName ?? 'Verified student'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {identity?.degree
                    ? `${identity.degree}${identity.graduationYear ? ` - Class of ${identity.graduationYear}` : ''}`
                    : 'Verified academic identity'}
                  {identity?.institution ? ` - ${identity.institution}` : ''}
                </p>
              </div>
            </div>

            {identity?.slug ? (
              <Link
                href={`/p/${identity.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-900 dark:hover:text-blue-400"
              >
                View public profile
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Verified Credentials
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                {identity?.verifiedCredentialCount ?? credentials.filter((entry) => entry.signatureValid).length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Endorsements</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                {identity?.endorsementCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Network Links</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                {identity?.relationshipCount ?? 0}
              </p>
            </div>
          </div>

          {identity?.skills?.length ? (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Validated skill graph</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {identity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Credential verification results
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {credentials.length} record{credentials.length === 1 ? '' : 's'} checked
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {credentials.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No active signed credentials were returned for this identity yet.
                </div>
              ) : (
                credentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="rounded-2xl border border-slate-200 px-5 py-4 dark:border-slate-800"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {credential.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {credential.institutionName} - {credential.credentialType}
                        </p>
                      </div>
                      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {credential.signatureValid ? 'Valid signature' : 'Invalid signature'}
                      </div>
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
                      Issued {formatDate(credential.issuedDate)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
