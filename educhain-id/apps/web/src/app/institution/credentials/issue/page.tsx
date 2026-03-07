'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Chip } from '@/components/atoms/Chip';
import { Alert } from '@/components/atoms/Alert';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, User, FileText, Eye } from 'lucide-react';
import { useIssueCredential } from '@/hooks/api';

type Step = 1 | 2 | 3;

export default function IssueCredentialPage() {
  const [step, setStep] = useState<Step>(1);
  const [studentEmail, setStudentEmail] = useState('');
  const [credentialType, setCredentialType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const issueCredential = useIssueCredential();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleIssue = () => {
    setError('');
    issueCredential.mutate(
      {
        studentId: studentEmail,
        credentialType,
        title,
        description: description || undefined,
      },
      {
        onSuccess: () => router.push('/institution/credentials'),
        onError: (err: any) => setError(err?.message ?? 'Failed to issue credential'),
      },
    );
  };

  const CREDENTIAL_TYPES = ['Bachelor\'s Degree', 'Master\'s Degree', 'Diploma', 'Certificate', 'Transcript'];

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/institution/credentials" className="inline-flex items-center gap-1 text-caption text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Credentials
      </Link>

      <h1 className="text-h2 text-[var(--text-primary)] mb-6">Issue Credential</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { num: 1, label: 'Select Student' },
          { num: 2, label: 'Credential Details' },
          { num: 3, label: 'Review & Issue' },
        ].map(({ num, label }, i) => (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                }`}
              >
                {num}
              </div>
              <span className={`text-caption hidden sm:inline ${step >= num ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                {label}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-[var(--border-default)]" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-h4 text-[var(--text-primary)]">Select Student</h2>
          </div>
          <Input
            label="Student Email"
            type="email"
            placeholder="student@university.edu"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            required
          />
          <div className="flex justify-end mt-6">
            <Button variant="primary" size="md" onClick={() => setStep(2)} disabled={!studentEmail}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-h4 text-[var(--text-primary)]">Credential Details</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-caption text-[var(--text-secondary)] mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {CREDENTIAL_TYPES.map((t) => (
                  <Chip key={t} selected={credentialType === t} onClick={() => setCredentialType(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bachelor of Science in Computer Science" required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." />
            <Input label="Issue Date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(3)} disabled={!credentialType || !title || !issueDate}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-h4 text-[var(--text-primary)]">Review & Issue</h2>
          </div>
          <div className="flex flex-col gap-3 text-body">
            <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Student</span>
              <span className="text-[var(--text-primary)]">{studentEmail}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Type</span>
              <span className="text-[var(--text-primary)]">{credentialType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Title</span>
              <span className="text-[var(--text-primary)]">{title}</span>
            </div>
            {description && (
              <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Description</span>
                <span className="text-[var(--text-primary)]">{description}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-[var(--text-secondary)]">Issue Date</span>
              <span className="text-[var(--text-primary)]">{issueDate}</span>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" size="md" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button variant="primary" size="lg" onClick={handleIssue} loading={issueCredential.isPending}>
              Issue Credential
            </Button>
          </div>
          {error && <Alert variant="error" className="mt-4">{error}</Alert>}
        </div>
      )}
    </div>
  );
}
