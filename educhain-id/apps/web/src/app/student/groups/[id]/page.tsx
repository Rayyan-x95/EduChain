'use client';

import React from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { ArrowLeft, Settings, UserPlus, MessageSquare, FolderOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGroupById } from '@/hooks/api';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const { data: group, isLoading } = useGroupById(params.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-body text-[var(--text-secondary)]">Group not found.</p>
        <Link href="/student/search">
          <Button variant="ghost" size="sm" className="mt-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
      </div>
    );
  }

  const members = group.members ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/student/search">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </div>

      {/* Group header */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-h2 text-[var(--text-primary)]">{group.name}</h1>
              <Badge variant="info">{group.visibility ?? 'Public'}</Badge>
            </div>
            <p className="text-body text-[var(--text-secondary)] max-w-lg">{group.description ?? ''}</p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {group.tags.map((tag: string) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-caption text-[var(--text-tertiary)]">{members.length} members</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="primary" size="md">
          <UserPlus className="h-4 w-4 mr-2" /> Invite Members
        </Button>
        <Button variant="outline" size="md">
          <MessageSquare className="h-4 w-4 mr-2" /> Discussion
        </Button>
        <Button variant="outline" size="md">
          <FolderOpen className="h-4 w-4 mr-2" /> Shared Files
        </Button>
      </div>

      {/* Members */}
      <section>
        <h2 className="text-h4 text-[var(--text-primary)] mb-3">Members ({members.length})</h2>
        <div className="space-y-2">
          {members.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg"
            >
              <Avatar src={null} alt={member.name ?? ''} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-body-medium text-[var(--text-primary)] truncate">{member.name ?? ''}</span>
                  {member.verified && <Badge variant="verified">Verified</Badge>}
                </div>
                <p className="text-caption text-[var(--text-secondary)]">{member.institution ?? ''}</p>
              </div>
              <Badge variant={member.role === 'Admin' ? 'info' : 'neutral'}>{member.role ?? 'Member'}</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
