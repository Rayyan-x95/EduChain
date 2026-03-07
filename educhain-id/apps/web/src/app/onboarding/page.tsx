'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { ShieldCheck, FileCheck, Users } from 'lucide-react';

const SLIDES = [
  {
    icon: <ShieldCheck className="h-16 w-16 text-[var(--color-primary)]" />,
    title: 'Verified Academic Identity',
    description: 'Build a trusted digital identity backed by your institution. Your credentials, verified on-chain.',
  },
  {
    icon: <FileCheck className="h-16 w-16 text-[var(--color-primary)]" />,
    title: 'Trusted Credentials',
    description: 'Receive tamper-proof academic credentials issued directly by your institution. Always verifiable.',
  },
  {
    icon: <Users className="h-16 w-16 text-[var(--color-primary)]" />,
    title: 'Collaborate Across Institutions',
    description: 'Discover students, form project groups, and collaborate on research across institutions worldwide.',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/auth/register');
    }
  };

  const skip = () => router.push('/auth/login');

  const slide = SLIDES[current];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[var(--bg-default)]">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md text-center animate-fade-in" key={current}>
        <div className="mb-8">{slide.icon}</div>
        <h2 className="text-h2 text-[var(--text-primary)] mb-3">{slide.title}</h2>
        <p className="text-body text-[var(--text-secondary)]">{slide.description}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-normal ${
              i === current ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-[var(--border-strong)]'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3 pb-12">
        <Button variant="primary" size="lg" className="w-full" onClick={next}>
          {current < SLIDES.length - 1 ? 'Next' : 'Get Started'}
        </Button>
        {current < SLIDES.length - 1 && (
          <Button variant="ghost" size="md" className="w-full" onClick={skip}>
            Skip
          </Button>
        )}
        {current === SLIDES.length - 1 && (
          <Button variant="ghost" size="md" className="w-full" onClick={() => router.push('/auth/login')}>
            Already have an account? Sign in
          </Button>
        )}
      </div>
    </div>
  );
}
