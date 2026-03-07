import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface StudentProfileHeaderProps {
  name: string;
  institution: string;
  degree: string;
  graduationYear: string;
  avatar?: string | null;
  verified?: boolean;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onCollaborate?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function StudentProfileHeader({
  name,
  institution,
  degree,
  graduationYear,
  avatar,
  verified = false,
  isOwnProfile = false,
  onFollow,
  onCollaborate,
  onEdit,
  className,
}: StudentProfileHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6', className)}>
      <Avatar src={avatar} alt={name} size="xl" />

      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          <h1 className="text-h2 text-[var(--text-primary)]">{name}</h1>
          {verified && <Badge variant="verified">Verified</Badge>}
        </div>
        <p className="text-body text-[var(--text-secondary)] mt-1">
          {institution} · {degree}
        </p>
        <p className="text-caption text-[var(--text-tertiary)]">Graduation: {graduationYear}</p>

        <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
          {isOwnProfile ? (
            <Button variant="outline" size="md" onClick={onEdit}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" size="md" onClick={onFollow}>
                Follow
              </Button>
              <Button variant="primary" size="md" onClick={onCollaborate}>
                Request Collaboration
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
