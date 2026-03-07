import React from 'react';
import { cn } from '@/lib/utils';
import { CredentialCard } from '../molecules/CredentialCard';
import { Button } from '../atoms/Button';
import { FileText } from 'lucide-react';

type CredentialStatus = 'verified' | 'pending' | 'revoked';

interface Credential {
  id: string;
  title: string;
  institution: string;
  issueDate: string;
  status: CredentialStatus;
}

interface CredentialListProps {
  credentials: Credential[];
  onViewAll?: () => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}

export function CredentialList({
  credentials,
  onViewAll,
  onViewDetails,
  className,
}: CredentialListProps) {
  if (credentials.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <FileText className="h-12 w-12 text-[var(--text-tertiary)] mb-3" aria-hidden="true" />
        <p className="text-body text-[var(--text-primary)]">No credentials yet</p>
        <p className="text-caption text-[var(--text-secondary)] mt-1">
          Credentials will appear here once issued by your institution.
        </p>
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 text-[var(--text-primary)]">
          Credentials{' '}
          <span className="text-caption text-[var(--text-tertiary)] font-normal">({credentials.length})</span>
        </h3>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All →
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {credentials.map((cred) => (
          <CredentialCard
            key={cred.id}
            title={cred.title}
            institution={cred.institution}
            issueDate={cred.issueDate}
            status={cred.status}
            onViewDetails={() => onViewDetails?.(cred.id)}
          />
        ))}
      </div>
    </section>
  );
}
