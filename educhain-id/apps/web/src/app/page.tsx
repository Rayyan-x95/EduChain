import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { EduChainLogo } from '@/components/atoms/EduChainLogo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <EduChainLogo size={48} />
        <h1 className="text-h1 text-[var(--text-primary)]">EduChain ID</h1>
      </div>

      <p className="text-body-large text-[var(--text-secondary)] max-w-lg mb-8">
        Decentralized student identity and credential verification platform.
        Connect institutions, students, and recruiters on a trusted network.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/auth/login">
          <Button variant="primary" size="lg">Sign In</Button>
        </Link>
        <Link href="/auth/register">
          <Button variant="outline" size="lg">Get Started</Button>
        </Link>
      </div>

      <div className="flex gap-6 mt-12 text-center">
        <div>
          <p className="text-h2 text-[var(--text-primary)]">50K+</p>
          <p className="text-caption text-[var(--text-tertiary)]">Students Verified</p>
        </div>
        <div>
          <p className="text-h2 text-[var(--text-primary)]">200+</p>
          <p className="text-caption text-[var(--text-tertiary)]">Institutions</p>
        </div>
        <div>
          <p className="text-h2 text-[var(--text-primary)]">1K+</p>
          <p className="text-caption text-[var(--text-tertiary)]">Recruiters</p>
        </div>
      </div>
    </div>
  );
}
