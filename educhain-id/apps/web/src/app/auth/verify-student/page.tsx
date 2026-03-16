'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/atoms/Alert';
import { IdCard, Mail, Clock, Building2 } from 'lucide-react';
import { useRequestVerification } from '@/hooks/api';

type VerificationState = 'form' | 'pending';

export default function VerifyStudentPage() {
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [state, setState] = useState<VerificationState>('form');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestVerification = useRequestVerification();
  const institutionId = searchParams.get('institutionId') ?? '';
  const institutionName = searchParams.get('institutionName') ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!institutionId) {
      setError('Please choose your institution before requesting verification.');
      return;
    }

    requestVerification.mutate(
      {
        institutionId,
        studentEmail: studentEmail.trim(),
        studentIdNumber: studentIdNumber.trim(),
      },
      {
        onSuccess: () => setState('pending'),
        onError: (err: any) => setError(err?.message ?? 'Verification request failed. Please try again.'),
      },
    );
  };

  if (state === 'pending') {
    return (
      <AuthLayout heading="Verification Pending" subheading="We're verifying your institution affiliation">
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-warning-light)] mb-4">
            <Clock className="h-8 w-8 text-[var(--color-warning)]" />
          </div>
          <p className="text-body text-[var(--text-secondary)] max-w-xs">
            Your verification request has been submitted. Your institution will review it shortly.
          </p>
          <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => router.push('/dashboard')}>
            Continue to Dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (!institutionId) {
    return (
      <AuthLayout heading="Choose Your Institution" subheading="We need the institution context before we can verify you">
        <div className="flex flex-col gap-4">
          <Alert variant="warning">
            Select your institution first so this verification request reaches the correct institution admin queue.
          </Alert>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push('/auth/select-institution')}
          >
            Select Institution
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heading="Verify Your Identity" subheading="Confirm your affiliation with your institution">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert variant="info">
          Enter the student email and ID number that your institution uses for enrollment records.
        </Alert>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
          <p className="text-caption uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Selected Institution
          </p>
          <div className="mt-2 flex items-center gap-2 text-body-medium text-[var(--text-primary)]">
            <Building2 className="h-4 w-4 text-[var(--color-primary)]" />
            {institutionName || 'Institution selected'}
          </div>
        </div>
        <Input
          label="Student ID"
          type="text"
          placeholder="e.g. STU-2024-0001"
          value={studentIdNumber}
          onChange={(e) => setStudentIdNumber(e.target.value)}
          icon={<IdCard className="h-4 w-4" />}
          required
        />
        <Input
          label="Student Email"
          type="email"
          placeholder="you@university.edu"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={requestVerification.isPending}>
          Submit Verification
        </Button>
        <Link href="/auth/select-institution" className="text-center text-sm font-medium text-[var(--color-primary)] hover:underline">
          Change institution
        </Link>
        {error && <Alert variant="error">{error}</Alert>}
      </form>
    </AuthLayout>
  );
}
