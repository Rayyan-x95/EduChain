import React from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  xs:  { container: 'h-6 w-6',   text: 'text-[10px]', indicator: 'h-2 w-2 border' },
  sm:  { container: 'h-8 w-8',   text: 'text-caption', indicator: 'h-2.5 w-2.5 border' },
  md:  { container: 'h-10 w-10', text: 'text-body',    indicator: 'h-2.5 w-2.5 border-2' },
  lg:  { container: 'h-14 w-14', text: 'text-h4',      indicator: 'h-3 w-3 border-2' },
  xl:  { container: 'h-20 w-20', text: 'text-h2',      indicator: 'h-3.5 w-3.5 border-2' },
  '2xl': { container: 'h-[120px] w-[120px]', text: 'text-display', indicator: 'h-4 w-4 border-2' },
};

// Deterministic color from name
const avatarColors = [
  'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600',
  'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarColors.length;
}

export function Avatar({ src, alt, size = 'md', online, className }: AvatarProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(s.container, 'rounded-full object-cover')}
        />
      ) : (
        <div
          className={cn(
            s.container,
            avatarColors[getColorIndex(alt)],
            'rounded-full flex items-center justify-center text-white font-semibold',
            s.text,
          )}
          role="img"
          aria-label={alt}
        >
          {getInitials(alt)}
        </div>
      )}
      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-success border-[var(--bg-elevated)]',
            s.indicator,
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
}
