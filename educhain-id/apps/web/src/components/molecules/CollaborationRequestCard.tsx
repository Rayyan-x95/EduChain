import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface CollaborationRequestCardProps {
  name: string;
  institution: string;
  avatar?: string | null;
  message: string;
  verified?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  className?: string;
}

export function CollaborationRequestCard({
  name,
  institution,
  avatar,
  message,
  verified = false,
  onAccept,
  onDecline,
  className,
}: CollaborationRequestCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg',
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
        </div>
      </div>

      <p className="text-body text-[var(--text-secondary)] mt-3 line-clamp-2">&ldquo;{message}&rdquo;</p>

      <div className="flex items-center gap-2 mt-4">
        <Button variant="primary" size="sm" onClick={onAccept}>
          Accept
        </Button>
        <Button variant="ghost" size="sm" onClick={onDecline}>
          Decline
        </Button>
      </div>
    </div>
  );
}
