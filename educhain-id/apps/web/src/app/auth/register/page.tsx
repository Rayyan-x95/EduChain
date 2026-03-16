'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { appHomeForRole, recordConsent, syncBackendUser } from '@/lib/auth-flow';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('You need to accept the terms and privacy notice to continue.');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session?.access_token) {
        const syncResult = await syncBackendUser(data.session.access_token);
        await Promise.all([
          recordConsent(data.session.access_token, 'terms_of_service'),
          recordConsent(data.session.access_token, 'privacy_policy'),
        ]);

        const destination =
          syncResult.is_new || syncResult.isNew
            ? '/onboarding/profile'
            : appHomeForRole(syncResult.role);
        router.replace(destination);
        return;
      }

      setSuccessMessage('Account created. Check your email to confirm the account, then sign in.');
      router.replace('/auth/login?registered=1');
    } catch (registerError) {
      setError(
        registerError instanceof Error ? registerError.message : 'Unable to create your account.',
      );
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
            Create Account
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Start your verified student identity
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            This registration flow now creates a real account. Institutions and recruiters can still
            access their workspaces once an administrator assigns those roles.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              {successMessage}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Full name
              </label>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                icon={<User className="h-4 w-4" />}
                required
              />
            </div>

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
                  placeholder="Choose a strong password"
                  autoComplete="new-password"
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  icon={<Lock className="h-4 w-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-semibold text-[var(--color-primary)] hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Create Account'}
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
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
