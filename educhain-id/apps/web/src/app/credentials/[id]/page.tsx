'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/organisms/ErrorState';
import { apiFetch } from '@/lib/api';
import { useCreateShareLink, useCredentialById, useVerifyCredential } from '@/hooks/api';

type CredentialRecord = {
  id: string;
  title: string;
  description?: string | null;
  credentialType: string;
  issuedDate: string | Date;
  credentialHash?: string | null;
  signature?: string | null;
  signedAt?: string | Date | null;
  keyId?: string | null;
  nonce?: string | null;
  status: 'active' | 'revoked';
  certificateUrl?: string | null;
  studentId: string;
  student?: { id?: string; fullName?: string | null } | null;
  institution?: { name?: string | null; domain?: string | null } | null;
};

type VerificationResult = {
  verified: boolean;
  reason?: string;
};

function formatDate(value?: string | Date | null) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function CredentialDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const credentialQuery = useCredentialById(params.id);
  const verifyQuery = useVerifyCredential(params.id);
  const createShareLink = useCreateShareLink();
  const [message, setMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const credential = credentialQuery.data as CredentialRecord | undefined;
  const verification = verifyQuery.data as VerificationResult | undefined;

  async function handleShare() {
    if (!credential) return;
    const response = (await createShareLink.mutateAsync({
      credentialId: credential.id,
    })) as { data?: { shareUrl?: string } };

    const shareUrl = response.data?.shareUrl;
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setMessage('Share link copied to clipboard.');
    }
  }

  async function handleDownload() {
    if (!credential) return;
    setDownloading(true);
    setMessage(null);
    try {
      const response = await apiFetch<{
        data?: { format?: string; vc?: unknown; data?: string; filename?: string };
      }>(`/credentials/${credential.id}/export-vc`);

      const payload = response.data;
      const content =
        payload?.format === 'jwt-vc'
          ? payload.data ?? ''
          : JSON.stringify(payload?.vc ?? response, null, 2);
      const blob = new Blob([content], {
        type: payload?.format === 'jwt-vc' ? 'application/jwt' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        payload?.filename ??
        `credential-${credential.id}.${payload?.format === 'jwt-vc' ? 'jwt' : 'json'}`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Credential export downloaded.');
    } catch {
      setMessage('Unable to download the credential export right now.');
    } finally {
      setDownloading(false);
    }
  }

  if (credentialQuery.isLoading || verifyQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </div>
    );
  }

  if (credentialQuery.isError || verifyQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Credential unavailable"
            message="We couldn't load this credential or its verification status."
            onRetry={() => {
              void credentialQuery.refetch();
              void verifyQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState title="Credential not found" message="The requested credential does not exist." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <TopAppBar
        title="Credential Detail"
        showBack
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[32px] border border-[var(--border-default)] bg-slate-950 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {credential.credentialType}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {verification?.verified ? 'Verified' : credential.status}
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">{credential.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
                {credential.description ?? 'No additional description was provided for this credential.'}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Recipient</p>
                  <p className="mt-2 text-lg font-semibold">
                    {credential.student?.fullName ?? 'Unknown student'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Issuer</p>
                  <p className="mt-2 text-lg font-semibold">
                    {credential.institution?.name ?? 'Unknown institution'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Issued</p>
                  <p className="mt-2 text-lg font-semibold">{formatDate(credential.issuedDate)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Verification</p>
              </div>
              <p className="mt-3 text-3xl font-bold">
                {verification?.verified ? 'Valid' : 'Needs review'}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                {verification?.verified
                  ? 'Signature, issuer key, and credential status all validated successfully.'
                  : verification?.reason ?? 'Verification details were unavailable.'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleShare()} disabled={createShareLink.isPending}>
                <Copy className="mr-2 h-4 w-4" />
                {createShareLink.isPending ? 'Creating Link...' : 'Copy Share Link'}
              </Button>
              <Button variant="outline" onClick={() => void handleDownload()} disabled={downloading}>
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Preparing Export...' : 'Download VC'}
              </Button>
              <Link href={`/verify/${credential.studentId}`}>
                <Button variant="outline">Open Student Verification</Button>
              </Link>
              {credential.certificateUrl && (
                <a href={credential.certificateUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Certificate File
                  </Button>
                </a>
              )}
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
                {message}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  Signed At
                </p>
                <p className="mt-3 text-xl font-bold text-[var(--text-primary)]">
                  {formatDate(credential.signedAt)}
                </p>
              </article>
              <article className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  Issuer Domain
                </p>
                <p className="mt-3 break-all text-xl font-bold text-[var(--text-primary)]">
                  {credential.institution?.domain ?? 'Not available'}
                </p>
              </article>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Verification Metadata
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              The cryptographic trail behind this record
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              {[
                ['Credential hash', credential.credentialHash ?? 'Not available'],
                ['Signature present', credential.signature ? 'Yes' : 'No'],
                ['Key ID', credential.keyId ?? 'Not available'],
                ['Nonce', credential.nonce ?? 'Not available'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    {label}
                  </p>
                  <p className="mt-3 break-all font-mono text-[var(--text-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
