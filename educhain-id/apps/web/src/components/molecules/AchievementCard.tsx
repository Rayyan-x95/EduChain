import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface AchievementCardProps {
  title: string;
  issuer: string;
  date: string;
  className?: string;
}

export function AchievementCard({ title, issuer, date, className }: AchievementCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
        className,
      )}
    >
      <Trophy className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <span className="text-body-medium text-[var(--text-primary)]">{title}</span>
        <p className="text-caption text-[var(--text-secondary)] mt-0.5">
          {issuer} · {date}
        </p>
      </div>
    </div>
  );
}
