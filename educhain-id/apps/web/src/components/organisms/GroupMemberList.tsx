import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { UserPlus } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar?: string | null;
  role: 'owner' | 'member';
}

interface GroupMemberListProps {
  members: Member[];
  isAdmin?: boolean;
  onInvite?: () => void;
  onRoleChange?: (memberId: string, role: 'owner' | 'member') => void;
  className?: string;
}

export function GroupMemberList({
  members,
  isAdmin = false,
  onInvite,
  onRoleChange,
  className,
}: GroupMemberListProps) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 text-[var(--text-primary)]">
          Members{' '}
          <span className="text-caption text-[var(--text-tertiary)] font-normal">({members.length})</span>
        </h3>
        {isAdmin && onInvite && (
          <Button variant="primary" size="sm" onClick={onInvite} icon={<UserPlus className="h-4 w-4" />}>
            Invite
          </Button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar src={member.avatar} alt={member.name} size="sm" />
            <span className="flex-1 text-body-medium text-[var(--text-primary)]">{member.name}</span>
            {isAdmin ? (
              <select
                className="text-caption bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md px-2 py-1 text-[var(--text-secondary)]"
                value={member.role}
                onChange={(e) => onRoleChange?.(member.id, e.target.value as 'owner' | 'member')}
              >
                <option value="owner">Owner</option>
                <option value="member">Member</option>
              </select>
            ) : (
              <span className="text-caption text-[var(--text-tertiary)] capitalize">{member.role}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
