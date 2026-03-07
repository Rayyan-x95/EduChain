'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EduChainLogo } from '@/components/atoms/EduChainLogo';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-default)]">
      <div className="flex items-center gap-3 animate-fade-in">
        <EduChainLogo size={56} variant="glow" />
        <div>
          <h1 className="text-h1 text-[var(--text-primary)]">EduChain ID</h1>
          <p className="text-body text-[var(--text-secondary)]">Your Verified Academic Identity</p>
        </div>
      </div>
      <div className="mt-8">
        <div className="h-1 w-24 rounded-full bg-[var(--bg-surface)] overflow-hidden">
          <div className="h-full bg-[var(--color-primary)] animate-[shimmer_1.5s_ease-in-out_infinite] w-1/3 rounded-full" />
        </div>
      </div>
    </div>
  );
}
