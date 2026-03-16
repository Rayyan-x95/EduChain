import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { ShieldCheck, Calendar, Building2, FileText, Download } from 'lucide-react';

type CredentialStatus = 'active' | 'revoked';

interface CredentialDetailViewProps {
  title: string;
  institution: string;
  issueDate: string;
  description?: string;
  status: CredentialStatus;
  studentName?: string;
  credentialId?: string;
  onClose?: () => void;
  onExport?: () => void;
  onRevoke?: () => void;
  showRevoke?: boolean;
  className?: string;
}

export function CredentialDetailView({
  title,
  institution,
  issueDate,
  description,
  status,
  studentName,
  credentialId,
  onClose,
  onExport,
  onRevoke,
  showRevoke = false,
  className,
}: CredentialDetailViewProps) {
  return (
    <div className={cn('bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--color-primary-subtle)] border-b border-[var(--border-subtle)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[var(--color-primary-subtle)]">
              <FileText className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-h3 text-[var(--text-primary)]">{title}</h2>
              <Badge variant={status} className="mt-1">{status === 'active' ? 'Verified' : 'Revoked'}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        {studentName && (
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--text-tertiary)] shrink-0" />
            <div>
              <p className="text-caption text-[var(--text-tertiary)]">Issued To</p>
              <p className="text-body-medium text-[var(--text-primary)]">{studentName}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-[var(--text-tertiary)] shrink-0" />
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">Issuing Institution</p>
            <p className="text-body-medium text-[var(--text-primary)]">{institution}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[var(--text-tertiary)] shrink-0" />
          <div>
            <p className="text-caption text-[var(--text-tertiary)]">Issue Date</p>
            <p className="text-body-medium text-[var(--text-primary)]">{issueDate}</p>
          </div>
        </div>

        {description && (
          <div>
            <p className="text-caption text-[var(--text-tertiary)] mb-1">Description</p>
            <p className="text-body text-[var(--text-secondary)]">{description}</p>
          </div>
        )}

        {credentialId && (
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <p className="text-caption text-[var(--text-tertiary)]">Credential ID</p>
            <p className="text-caption font-mono text-[var(--text-secondary)]">{credentialId}</p>
          </div>
        )}

        {/* Verification Status */}
        {status === 'active' && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--color-success-light)]">
            <ShieldCheck className="h-5 w-5 text-[var(--color-success)]" />
            <p className="text-body text-[var(--color-success)]">This credential has been cryptographically verified</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 p-6 border-t border-[var(--border-subtle)]">
        {onExport && (
          <Button variant="outline" size="md" onClick={onExport} icon={<Download className="h-4 w-4" />}>
            Export
          </Button>
        )}
        {showRevoke && status !== 'revoked' && onRevoke && (
          <Button variant="danger" size="md" onClick={onRevoke}>
            Revoke Credential
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="md" onClick={onClose} className="ml-auto">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
