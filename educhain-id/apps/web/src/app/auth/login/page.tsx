'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { appHomeForRole, syncBackendUser } from '@/lib/auth-flow';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.session?.access_token) {
        throw new Error('No active session returned after sign-in');
      }

      const syncResult = await syncBackendUser(data.session.access_token);
      const destination =
        syncResult.is_new || syncResult.isNew
          ? '/onboarding/profile'
          : appHomeForRole(syncResult.role);

      router.replace(destination);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in right now.');
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[var(--bg-default)] text-[var(--text-primary)]">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        <div className="rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Sign In
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Access your verified identity
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Continue to your student wallet, institution console, or recruiter workspace with a
            real account instead of the old demo login.
          </p>

          {searchParams.get('registered') === '1' && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              Account created successfully. Sign in to continue.
            </div>
          )}

          {searchParams.get('reset') === '1' && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
              Password updated. You can sign in now.
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Email address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                icon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--text-secondary)]">
                Prefer passwordless? Use Google below.
              </span>
              <Link
                href="/auth/forgot-password"
                className="font-semibold text-[var(--color-primary)] hover:underline"
              >
                Forgot password
              </Link>
            </div>

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              Or
            </span>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            className="mt-6"
            onClick={() => void signInWithGoogle()}
          >
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Need an account?{' '}
            <Link href="/auth/register" className="font-semibold text-[var(--color-primary)] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
