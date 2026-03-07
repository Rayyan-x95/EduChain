import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Star } from 'lucide-react';

interface RecruiterStudentCardProps {
  name: string;
  institution: string;
  degree: string;
  avatar?: string | null;
  skills: string[];
  verified?: boolean;
  shortlisted?: boolean;
  onView?: () => void;
  onShortlist?: () => void;
  className?: string;
}

export function RecruiterStudentCard({
  name,
  institution,
  degree,
  avatar,
  skills,
  verified = false,
  shortlisted = false,
  onView,
  onShortlist,
  className,
}: RecruiterStudentCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
        'transition-all duration-normal hover:shadow-sm group',
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
          <p className="text-caption text-[var(--text-secondary)]">{institution}</p>
          <p className="text-caption text-[var(--text-tertiary)]">{degree}</p>
        </div>
        <button
          onClick={onShortlist}
          className={cn(
            'shrink-0 p-1 rounded-md transition-colors',
            shortlisted
              ? 'text-[var(--color-warning)]'
              : 'text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100',
          )}
          aria-label={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <Star className={cn('h-5 w-5', shortlisted && 'fill-current')} />
        </button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-caption px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)]"
            >
              {s}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-caption text-[var(--text-tertiary)]">+{skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={onView}>
          View Profile
        </Button>
      </div>
    </div>
  );
}
