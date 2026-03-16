'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import {
  useCreateRecruiterProfile,
  useRecruiterProfile,
  useUpdateRecruiterProfile,
} from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type RecruiterProfile = {
  companyName?: string | null;
  position?: string | null;
  bio?: string | null;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Recruiter';
  return (email.split('@')[0] ?? 'Recruiter')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function RecruiterSettingsPage() {
  const { user } = useAuth();
  const profileQuery = useRecruiterProfile();
  const createProfile = useCreateRecruiterProfile();
  const updateProfile = useUpdateRecruiterProfile();
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'recruiter@educhain.local',
    avatar: null,
  };

  const notFound = (profileQuery.error as { status?: number } | null)?.status === 404;
  const profile = profileQuery.data as RecruiterProfile | undefined;

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName ?? '');
    setPosition(profile.position ?? '');
    setBio(profile.bio ?? '');
  }, [profile]);

  if (profileQuery.isLoading) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <div className="h-80 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </DashboardLayout>
    );
  }

  if (profileQuery.isError && !notFound) {
    return (
      <DashboardLayout role="recruiter" user={layoutUser}>
        <ErrorState
          title="Recruiter settings unavailable"
          message="We couldn't load your recruiter profile."
          onRetry={() => void profileQuery.refetch()}
        />
      </DashboardLayout>
    );
  }

  const saving = createProfile.isPending || updateProfile.isPending;

  return (
    <DashboardLayout role="recruiter" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Recruiter Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Manage your hiring identity
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Keep your company context current so students understand who is evaluating them and why
          your outreach is trustworthy.
        </p>
      </section>

      <section className="mt-6 rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            const payload = {
              companyName: companyName.trim(),
              position: position.trim() || undefined,
              bio: bio.trim() || undefined,
            };

            const action = notFound ? createProfile : updateProfile;
            action.mutate(payload, {
              onSuccess: () => {
                setMessage(notFound ? 'Recruiter profile created.' : 'Recruiter profile updated.');
              },
            });
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Company name
              </label>
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 text-sm text-[var(--text-primary)]"
                placeholder="Acme Labs"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Role
              </label>
              <input
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 text-sm text-[var(--text-primary)]"
                placeholder="Senior Technical Recruiter"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
              Team bio
            </label>
            <textarea
              rows={6}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-3 text-sm text-[var(--text-primary)]"
              placeholder="Describe the team, hiring focus, and the type of students you want to reach."
            />
          </div>

          <Button type="submit" disabled={saving || companyName.trim().length === 0}>
            {saving ? 'Saving...' : notFound ? 'Create Recruiter Profile' : 'Save Changes'}
          </Button>
        </form>

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {message}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
