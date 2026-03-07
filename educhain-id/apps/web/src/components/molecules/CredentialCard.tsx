import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { GraduationCap, ChevronRight } from 'lucide-react';

type CredentialStatus = 'verified' | 'pending' | 'revoked';

interface CredentialCardProps {
  title: string;
  institution: string;
  issueDate: string;
  status: CredentialStatus;
  onViewDetails?: () => void;
  className?: string;
}

export function CredentialCard({
  title,
  institution,
  issueDate,
  status,
  onViewDetails,
  className,
}: CredentialCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
        'transition-all duration-normal hover:shadow-sm',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <GraduationCap className="h-6 w-6 text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-medium text-[var(--text-primary)]">{title}</span>
            <Badge variant={status}>
              {status === 'verified' ? 'Verified' : status === 'pending' ? 'Pending' : 'Revoked'}
            </Badge>
          </div>
          <p className="text-caption text-[var(--text-secondary)] mt-0.5">{institution}</p>
          <p className="text-caption text-[var(--text-tertiary)] mt-0.5">Issued: {issueDate}</p>
        </div>
      </div>

      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={onViewDetails} icon={<ChevronRight className="h-4 w-4" />}>
          View Details
        </Button>
      </div>
    </div>
  );
}
