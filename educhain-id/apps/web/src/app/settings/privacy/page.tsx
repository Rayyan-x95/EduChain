'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import {
  useCancelAccountDeletion,
  useRequestAccountDeletion,
  useStudentProfile,
  useUpdateIdentityVisibility,
} from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/api/v1';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const profileQuery = useStudentProfile();
  const updateVisibility = useUpdateIdentityVisibility();
  const deleteAccount = useRequestAccountDeletion();
  const cancelDeletion = useCancelAccountDeletion();
  const [deletionReason, setDeletionReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const profile = profileQuery.data as
    | {
        user?: {
          email?: string | null;
          identityVisibility?: 'public' | 'connections_only' | 'private' | null;
        } | null;
      }
    | undefined;

  const email = profile?.user?.email ?? user?.email ?? '';
  const visibility = profile?.user?.identityVisibility ?? 'public';

  async function handleExport() {
    setError(null);
    setMessage(null);
    setExporting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('You need to be signed in to export your data.');
      }

      const response = await fetch(`${API_BASE}/gdpr/export`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to export your data right now.');
      }

      const payload = await response.json();
      const blob = new Blob([JSON.stringify(payload.data ?? payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'educhain-gdpr-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Your data export has been downloaded.');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Unable to export your data.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <TopAppBar
        title="Privacy Controls"
        showBack
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Visibility
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Decide how discoverable your identity is
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Privacy controls affect who can discover your profile and how far your trust signals
            travel across the platform.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                value: 'public',
                title: 'Public',
                copy: 'Visible to anyone with the link and in discovery where applicable.',
              },
              {
                value: 'connections_only',
                title: 'Connections only',
                copy: 'Reserved for trusted relationship paths and direct sharing moments.',
              },
              {
                value: 'private',
                title: 'Private',
                copy: 'Hidden from discovery and public identity routes until you opt back in.',
              },
            ].map((option) => (
              <button
                key={option.value}
                className={`rounded-[24px] border p-5 text-left transition-colors ${
                  visibility === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100'
                    : 'border-[var(--border-default)] bg-[var(--bg-default)] text-[var(--text-primary)]'
                }`}
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  updateVisibility.mutate(option.value, {
                    onSuccess: () => setMessage(`Visibility updated to ${option.title}.`),
                    onError: (mutationError) =>
                      setError(
                        mutationError instanceof Error
                          ? mutationError.message
                          : 'Unable to update visibility.',
                      ),
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                    {option.title}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6">{option.copy}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Data Rights
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            Export or remove your account data
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            EduChain supports downloadable data exports and a deletion workflow with a grace period.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => void handleExport()} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Preparing Export...' : 'Download My Data'}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                cancelDeletion.mutate(undefined, {
                  onSuccess: () => {
                    setError(null);
                    setMessage('Pending account deletion has been cancelled.');
                  },
                  onError: (mutationError) =>
                    setError(
                      mutationError instanceof Error
                        ? mutationError.message
                        : 'Unable to cancel deletion.',
                    ),
                })
              }
            >
              Cancel Deletion Request
            </Button>
          </div>

          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-300" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Delete account</h3>
                <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
                  Enter your account email to confirm deletion. The system schedules deletion with a
                  grace period rather than immediately wiping the record.
                </p>
                <textarea
                  rows={3}
                  value={deletionReason}
                  onChange={(event) => setDeletionReason(event.target.value)}
                  placeholder="Optional reason for deletion"
                  className="mt-4 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-red-900/40 dark:bg-slate-950 dark:text-slate-100"
                />
                <Button
                  variant="destructive"
                  className="mt-4"
                  disabled={!email || deleteAccount.isPending}
                  onClick={() =>
                    deleteAccount.mutate(
                      {
                        confirmEmail: email,
                        reason: deletionReason.trim() || undefined,
                      },
                      {
                        onSuccess: () => {
                          setError(null);
                          setMessage('Deletion request submitted. You can still cancel during the grace period.');
                        },
                        onError: (mutationError) =>
                          setError(
                            mutationError instanceof Error
                              ? mutationError.message
                              : 'Unable to submit deletion request.',
                          ),
                      },
                    )
                  }
                >
                  Request Account Deletion
                </Button>
              </div>
            </div>
          </div>
        </section>

        {(message || error) && (
          <section
            className={`rounded-[24px] border px-4 py-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
            }`}
          >
            {error ?? message}
          </section>
        )}
      </main>
    </div>
  );
}
