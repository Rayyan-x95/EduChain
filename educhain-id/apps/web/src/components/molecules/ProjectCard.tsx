import React from 'react';
import { cn } from '@/lib/utils';
import { Chip } from '../atoms/Chip';
import { Badge } from '../atoms/Badge';

interface ProjectCardProps {
  title: string;
  description: string;
  techStack: string[];
  memberCount: number;
  status: 'active' | 'completed';
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({
  title,
  description,
  techStack,
  memberCount,
  status,
  onClick,
  className,
}: ProjectCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
        'transition-all duration-normal hover:shadow-sm cursor-pointer',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <h3 className="text-body-medium text-[var(--text-primary)]">{title}</h3>
      <p className="text-body text-[var(--text-secondary)] mt-1 line-clamp-2">{description}</p>

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {techStack.slice(0, 3).map((tech) => (
            <Chip key={tech}>{tech}</Chip>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 text-caption text-[var(--text-tertiary)]">
        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <Badge variant={status === 'active' ? 'info' : 'neutral'}>
          {status === 'active' ? 'Active' : 'Completed'}
        </Badge>
      </div>
    </div>
  );
}
