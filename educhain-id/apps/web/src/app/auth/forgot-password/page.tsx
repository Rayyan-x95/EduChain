'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/atoms/Alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout heading="Check Your Email" subheading="We sent a password reset link">
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-success-light)] mb-4">
            <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          <p className="text-body text-[var(--text-secondary)] max-w-xs">
            If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link.
          </p>
          <Link href="/auth/login" className="mt-6">
            <Button variant="primary" size="lg">Back to Sign In</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heading="Forgot Password" subheading="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={loading}>
          Send Reset Link
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-caption text-[var(--color-primary)] hover:underline">
          <ArrowLeft className="h-3 w-3" /> Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
