'use client';

import React from 'react';
import { CredentialDetailView } from '@/components/organisms/CredentialDetailView';
import { Button } from '@/components/atoms/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCredentialById } from '@/hooks/api';

export default function CredentialDetailPage({ params }: { params: { id: string } }) {
  const { data: credential, isLoading } = useCredentialById(params.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
    );
  }

  if (!credential) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-body text-[var(--text-secondary)]">Credential not found.</p>
        <Link href="/student/credentials">
          <Button variant="ghost" size="sm" className="mt-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Credentials</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/student/credentials">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Credentials
        </Button>
      </Link>

      <CredentialDetailView
        title={credential.title}
        institution={credential.institution ?? ''}
        issueDate={credential.issueDate ?? ''}
        status={credential.status as 'active' | 'revoked'}
        description={credential.description ?? ''}
      />

      {/* Additional details */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6 space-y-4">
        <h3 className="text-h4 text-[var(--text-primary)]">Credential Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">Expiry Date</p>
            <p className="text-body text-[var(--text-primary)]">{credential.expiryDate ?? 'No Expiry'}</p>
          </div>
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">Credential Hash</p>
            <p className="text-body text-[var(--text-primary)] font-mono text-sm">{credential.credentialHash ?? '—'}</p>
          </div>
        </div>

        {credential.skills && credential.skills.length > 0 && (
          <div>
            <p className="text-caption text-[var(--text-tertiary)] mb-2">Associated Skills</p>
            <div className="flex flex-wrap gap-2">
              {credential.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-2 py-1 text-caption bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md text-[var(--text-secondary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
