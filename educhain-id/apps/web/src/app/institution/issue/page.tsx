'use client';

import { FormEvent, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useIssueCredential } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Institution Admin';
  return (email.split('@')[0] ?? 'Institution Admin')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function IssueCredentialPage() {
  const { user } = useAuth();
  const issueMutation = useIssueCredential();
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [credentialType, setCredentialType] = useState('degree');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10));
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'institution@educhain.local',
    avatar: null,
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultMessage(null);

    const identifier = studentIdentifier.trim();
    const payload = identifier.includes('@')
      ? { studentEmail: identifier }
      : { studentId: identifier };

    try {
      await issueMutation.mutateAsync({
        ...payload,
        credentialType,
        title,
        description: description.trim() || undefined,
        issuedDate,
      });

      setResultMessage('Credential issued successfully. The record is now queued for signing if the key is available.');
      setStudentIdentifier('');
      setTitle('');
      setDescription('');
    } catch (error) {
      setResultMessage(error instanceof Error ? error.message : 'Unable to issue the credential.');
    }
  }

  return (
    <DashboardLayout role="institution_admin" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Credential Issuance
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Issue a verified academic record
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Submit a student UUID or the verified student email. EduChain will hash the credential,
          attach institution context, and sign it with the active issuer key when available.
        </p>
      </section>

      <section className="mt-6 rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Student UUID or Verified Email
              </label>
              <Input
                placeholder="student UUID or student@institution.edu"
                value={studentIdentifier}
                onChange={(event) => setStudentIdentifier(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Credential Category
              </label>
              <select
                value={credentialType}
                onChange={(event) => setCredentialType(event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="degree">Degree</option>
                <option value="certificate">Certificate</option>
                <option value="award">Award</option>
                <option value="assessment">Assessment</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Credential Title
              </label>
              <Input
                placeholder="Bachelor of Science in Computer Science"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Issued Date
              </label>
              <Input
                type="date"
                value={issuedDate}
                onChange={(event) => setIssuedDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add the achievement context, honours, score band, or scope of the credential."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {resultMessage && (
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] p-4 text-sm text-[var(--text-secondary)]">
              {resultMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={issueMutation.isPending}>
              {issueMutation.isPending ? 'Issuing...' : 'Issue Credential'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStudentIdentifier('');
                setCredentialType('degree');
                setTitle('');
                setDescription('');
                setIssuedDate(new Date().toISOString().slice(0, 10));
                setResultMessage(null);
              }}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  );
}
