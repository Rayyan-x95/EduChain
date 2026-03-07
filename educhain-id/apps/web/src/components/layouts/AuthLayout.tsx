import React from 'react';
import { cn } from '@/lib/utils';
import { EduChainLogo } from '../atoms/EduChainLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  subheading?: string;
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
  return (
    <main id="main-content" className="flex items-center justify-center min-h-screen bg-[var(--bg-default)] px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <EduChainLogo size={40} />
            <span className="text-h3 text-[var(--text-primary)]">EduChain</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-md p-6 sm:p-8">
          {heading && (
            <div className="text-center mb-6">
              <h1 className="text-h3 text-[var(--text-primary)]">{heading}</h1>
              {subheading && (
                <p className="text-body text-[var(--text-secondary)] mt-1">{subheading}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
