import React from 'react';
import { cn } from '@/lib/utils';

interface EduChainLogoProps {
  size?: number;
  className?: string;
  variant?: 'flat' | 'glow';
}

/**
 * EduChain interlocking hexagon chain-link logo mark.
 * Flat variant: solid #2563EB fill.
 * Glow variant: gradient blue with subtle outer glow.
 */
export function EduChainLogo({ size = 32, className, variant = 'flat' }: EduChainLogoProps) {
  const id = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-label="EduChain logo"
      role="img"
    >
      {variant === 'glow' && (
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      <g
        fill={variant === 'glow' ? `url(#${id}-grad)` : '#2563EB'}
        filter={variant === 'glow' ? `url(#${id}-glow)` : undefined}
      >
        {/* Left hexagon */}
        <path d="M22 8 L34 8 L40 20 L34 32 L22 32 L16 20 Z" />
        {/* Right hexagon (interlocked, shifted down-right) */}
        <path d="M30 32 L42 32 L48 44 L42 56 L30 56 L24 44 Z" />
        {/* Chain bridge connecting the two hexagons */}
        <path d="M30 26 L34 32 L30 38 L26 32 Z" opacity="0.85" />
      </g>
    </svg>
  );
}
