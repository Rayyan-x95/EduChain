'use client';

import React from 'react';
import { CredentialList } from '@/components/organisms/CredentialList';
import { Loader2 } from 'lucide-react';
import { useMyCredentials } from '@/hooks/api';

export default function StudentCredentialsPage() {
  const { data: credentials, isLoading } = useMyCredentials();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">My Credentials</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">All your verified and pending credentials</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
      ) : (
        <CredentialList credentials={credentials ?? []} />
      )}
    </div>
  );
}
