'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { Mail, Lock, User, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Role = 'student' | 'institution' | 'recruiter';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Redirect to callback to sync user with backend
    window.location.href = '/auth/callback';
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout heading="Create Account" subheading="Join the EduChain ID network">
      {error && (
        <div className="mb-4 p-3 rounded-md bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-body-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-default)]" />
        </div>
        <div className="relative flex justify-center text-caption">
          <span className="bg-[var(--bg-default)] px-4 text-[var(--text-tertiary)]">or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-caption text-[var(--text-secondary)] mb-2">I am a</label>
          <div className="flex gap-2">
            {(['student', 'institution', 'recruiter'] as Role[]).map((r) => (
              <Chip key={r} selected={role === r} onClick={() => setRole(r)}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Chip>
            ))}
          </div>
        </div>
        <Input
          label={role === 'institution' ? 'Institution Name' : 'Full Name'}
          type="text"
          placeholder={role === 'institution' ? 'University of Example' : 'John Doe'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={role === 'institution' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
          required
          autoComplete="new-password"
        />
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
          Create Account
        </Button>
      </form>
      <p className="text-center text-caption text-[var(--text-secondary)] mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
