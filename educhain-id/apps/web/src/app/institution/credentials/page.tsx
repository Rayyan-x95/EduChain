'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/organisms/Shared';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import Link from 'next/link';
import { Search, Plus, FileText, Loader2 } from 'lucide-react';
import { useInstitutionCredentials } from '@/hooks/api';

export default function CredentialsHistoryPage() {
  const [query, setQuery] = useState('');
  const { data: credentials, isLoading } = useInstitutionCredentials();

  const allCredentials = credentials ?? [];
  const filtered = allCredentials.filter((c: any) =>
    (c.title ?? '').toLowerCase().includes(query.toLowerCase()) ||
    (c.studentName ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">Credentials</h1>
          <p className="text-body text-[var(--text-secondary)] mt-1">All issued credentials</p>
        </div>
        <Link href="/institution/credentials/issue">
          <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>Issue New</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search credentials..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'title',
                header: 'Credential',
                render: (row: any) => (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-body-medium text-[var(--text-primary)]">{row.title as string}</span>
                  </div>
                ),
              },
              { key: 'studentName', header: 'Student' },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => <Badge variant={row.status as 'verified' | 'pending' | 'revoked'}>{row.status as string}</Badge>,
              },
              { key: 'issueDate', header: 'Issued' },
            ]}
            data={filtered}
          />
        )}
      </div>
    </div>
  );
}
