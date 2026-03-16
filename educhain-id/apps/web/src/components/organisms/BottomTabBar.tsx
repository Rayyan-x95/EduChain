'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Search, FolderOpen, User } from 'lucide-react';

const TABS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Discover', href: '/discovery', icon: Search },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Profile', href: '/profile', icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-elevated)] border-t border-[var(--border-default)] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex items-center h-16">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 h-full min-w-[48px] min-h-[48px] transition-colors',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-tertiary)]',
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-[3px] rounded-b-full bg-[var(--color-primary)]" />
              )}
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} aria-hidden="true" />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
