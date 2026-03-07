import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface EduChainLogoProps {
  size?: number;
  variant?: 'flat' | 'glow';
}

export function EduChainLogo({ size = 32, variant = 'flat' }: EduChainLogoProps) {
  const fill = variant === 'glow' ? 'url(#grad)' : '#2563EB';

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {variant === 'glow' && (
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
        </Defs>
      )}
      <G fill={fill}>
        <Path d="M22 8 L34 8 L40 20 L34 32 L22 32 L16 20 Z" />
        <Path d="M30 32 L42 32 L48 44 L42 56 L30 56 L24 44 Z" />
        <Path d="M30 26 L34 32 L30 38 L26 32 Z" opacity={0.85} />
      </G>
    </Svg>
  );
}
