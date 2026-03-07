'use client';

import React from 'react';
import { DataTable } from '@/components/organisms/Shared';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { useShortlist, useRemoveFromShortlist } from '@/hooks/api';

export default function RecruiterShortlistPage() {
  const { data: shortlist, isLoading } = useShortlist();
  const removeFromShortlist = useRemoveFromShortlist();

  const items = shortlist ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">Shortlist</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">Your shortlisted candidates ({items.length})</p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Candidate',
              render: (row: any) => (
                <div className="flex items-center gap-3">
                  <Avatar alt={row.studentName ?? row.name ?? ''} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body-medium text-[var(--text-primary)]">{row.studentName ?? row.name ?? ''}</p>
                      {row.verified && <Badge variant="verified">Verified</Badge>}
                    </div>
                    <p className="text-caption text-[var(--text-tertiary)]">{row.institution ?? ''}</p>
                  </div>
                </div>
              ),
            },
            { key: 'degree', header: 'Degree' },
            {
              key: 'skills',
              header: 'Skills',
              render: (row: any) => (
                <div className="flex gap-1 flex-wrap">
                  {(row.skills as string[] ?? []).map((s: string) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              ),
            },
            { key: 'addedDate', header: 'Added' },
            {
              key: 'actions',
              header: '',
              render: (row: any) => (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Profile</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-4 w-4 text-[var(--color-danger)]" />}
                    onClick={() => removeFromShortlist.mutate(row.studentId ?? row.id)}
                  />
                </div>
              ),
            },
          ]}
          data={items}
        />
      </div>
    </div>
  );
}
