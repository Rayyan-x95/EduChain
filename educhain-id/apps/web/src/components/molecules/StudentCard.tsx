import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Chip } from '../atoms/Chip';
import { Button } from '../atoms/Button';

interface StudentCardProps {
  name: string;
  institution: string;
  avatar?: string | null;
  skills: string[];
  verified?: boolean;
  onViewProfile?: () => void;
  onCollaborate?: () => void;
  className?: string;
}

export function StudentCard({
  name,
  institution,
  avatar,
  skills,
  verified = false,
  onViewProfile,
  onCollaborate,
  className,
}: StudentCardProps) {
  const visibleSkills = skills.slice(0, 3);
  const overflow = skills.length - 3;

  return (
    <div
      className={cn(
        'p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
        'transition-all duration-normal hover:shadow-sm hover:border-[var(--border-focus)]/20',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar src={avatar} alt={name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-body-medium text-[var(--text-primary)] truncate">{name}</span>
            {verified && <Badge variant="verified">Verified</Badge>}
          </div>
          <p className="text-caption text-[var(--text-secondary)] truncate">{institution}</p>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {visibleSkills.map((skill) => (
            <Chip key={skill}>{skill}</Chip>
          ))}
          {overflow > 0 && (
            <Chip className="text-[var(--text-tertiary)]">+{overflow}</Chip>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={onViewProfile}>
          View Profile
        </Button>
        <Button variant="outline" size="sm" onClick={onCollaborate}>
          Collaborate
        </Button>
      </div>
    </div>
  );
}
