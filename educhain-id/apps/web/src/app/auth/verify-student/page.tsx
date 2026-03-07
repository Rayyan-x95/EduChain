'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/atoms/Alert';
import { IdCard, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRequestVerification } from '@/hooks/api';

type VerificationState = 'form' | 'pending' | 'verified' | 'rejected';

export default function VerifyStudentPage() {
  const [studentId, setStudentId] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [state, setState] = useState<VerificationState>('form');
  const [error, setError] = useState('');
  const router = useRouter();
  const requestVerification = useRequestVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    requestVerification.mutate(
      { studentId, institutionEmail },
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
          <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => router.push('/student/home')}>
            Continue to Dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (state === 'verified') {
    return (
      <AuthLayout heading="Verified!" subheading="Your institution has confirmed your enrollment">
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-success-light)] mb-4">
            <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          <p className="text-body text-[var(--text-secondary)]">You now have a verified academic identity.</p>
          <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => router.push('/student/home')}>
            Go to Dashboard
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (state === 'rejected') {
    return (
      <AuthLayout heading="Verification Failed" subheading="Your institution could not verify your enrollment">
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-danger-light)] mb-4">
            <XCircle className="h-8 w-8 text-[var(--color-danger)]" />
          </div>
          <p className="text-body text-[var(--text-secondary)] max-w-xs">
            Please check your student ID and institution email and try again.
          </p>
          <Button variant="outline" size="lg" className="w-full mt-6" onClick={() => setState('form')}>
            Try Again
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heading="Verify Your Identity" subheading="Confirm your affiliation with your institution">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert variant="info">
          Enter your student ID and institution email to verify your enrollment.
        </Alert>
        <Input
          label="Student ID"
          type="text"
          placeholder="e.g. STU-2024-0001"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          icon={<IdCard className="h-4 w-4" />}
          required
        />
        <Input
          label="Institution Email"
          type="email"
          placeholder="you@university.edu"
          value={institutionEmail}
          onChange={(e) => setInstitutionEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={requestVerification.isPending}>
          Submit Verification
        </Button>
        {error && <Alert variant="error">{error}</Alert>}
      </form>
    </AuthLayout>
  );
}
