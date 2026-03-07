'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/organisms/Shared';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Avatar } from '@/components/atoms/Avatar';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useVerificationsByInstitution, useReviewVerification } from '@/hooks/api';

export default function InstitutionStudentsPage() {
  const { user } = useAuth();
  const institutionId = user?.id ?? '';
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  const { data: verifications, isLoading } = useVerificationsByInstitution(
    institutionId,
    filter === 'all' ? undefined : filter,
  );
  const reviewVerification = useReviewVerification();

  const items = (verifications ?? []).filter((s: any) =>
    (s.studentName ?? s.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">Students</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">Manage student verifications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'verified'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Student',
                render: (row: any) => (
                  <div className="flex items-center gap-3">
                    <Avatar alt={row.studentName ?? row.name ?? ''} size="sm" />
                    <div>
                      <p className="text-body-medium text-[var(--text-primary)]">{row.studentName ?? row.name ?? ''}</p>
                      <p className="text-caption text-[var(--text-tertiary)]">{row.email ?? ''}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'degree', header: 'Degree' },
              { key: 'year', header: 'Year' },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => <Badge variant={row.status as 'verified' | 'pending'}>{row.status as string}</Badge>,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row: any) =>
                  (row.status as string) === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle className="h-4 w-4" />}
                        onClick={() => reviewVerification.mutate({ verificationId: row.id, decision: 'approved' })}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="h-4 w-4" />}
                        onClick={() => reviewVerification.mutate({ verificationId: row.id, decision: 'rejected' })}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-caption text-[var(--text-tertiary)]">&mdash;</span>
                  ),
              },
            ]}
            data={items}
          />
        )}
      </div>
    </div>
  );
}
