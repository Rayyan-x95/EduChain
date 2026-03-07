'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { EduChainLogo } from '../atoms/EduChainLogo';
import { useTheme } from '@/providers/ThemeProvider';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Search,
  BookOpen,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

type UserRole = 'institution_admin' | 'recruiter' | 'student';

const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  institution_admin: 'institution',
  recruiter: 'recruiter',
  student: 'student',
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  institution_admin: [
    { label: 'Dashboard', href: '/institution/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Students', href: '/institution/students', icon: <Users className="h-5 w-5" /> },
    { label: 'Credentials', href: '/institution/credentials', icon: <FileCheck className="h-5 w-5" /> },
    { label: 'Analytics', href: '/institution/analytics', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Settings', href: '/institution/settings', icon: <Settings className="h-5 w-5" /> },
  ],
  recruiter: [
    { label: 'Discover', href: '/recruiter/discover', icon: <Search className="h-5 w-5" /> },
    { label: 'Shortlist', href: '/recruiter/shortlist', icon: <Users className="h-5 w-5" /> },
    { label: 'Analytics', href: '/recruiter/analytics', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Settings', href: '/recruiter/settings', icon: <Settings className="h-5 w-5" /> },
  ],
  student: [
    { label: 'Home', href: '/student/home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Profile', href: '/student/profile', icon: <Users className="h-5 w-5" /> },
    { label: 'Credentials', href: '/student/credentials', icon: <FileCheck className="h-5 w-5" /> },
    { label: 'Projects', href: '/student/projects', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Collaborations', href: '/student/collaborations', icon: <Search className="h-5 w-5" /> },
    { label: 'Search', href: '/student/search', icon: <Search className="h-5 w-5" /> },
  ],
};

interface DashboardLayoutProps {
  role: UserRole;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardLayout({ role, user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on ESC or click outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Close sidebar on ESC
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const navItems = NAV_ITEMS[role];
  const routePrefix = ROLE_ROUTE_PREFIX[role];
  const settingsHref = `/${routePrefix}/settings`;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-default)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--bg-overlay)] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[256px] bg-[var(--bg-elevated)] border-r border-[var(--border-default)] flex flex-col transition-transform duration-normal lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
          <Link href={`/${routePrefix}/dashboard`} className="flex items-center gap-2">
            <EduChainLogo size={32} />
            <span className="text-h4 text-[var(--text-primary)]">EduChain</span>
          </Link>
          <button
            className="lg:hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Main navigation">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 h-10 px-3 rounded-md text-body transition-colors duration-fast',
                      isActive
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]',
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border-subtle)] p-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full h-10 px-3 rounded-md text-body text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
          <button
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button
              className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-[var(--color-danger)] rounded-full" />
            </button>

            {/* User menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                className="flex items-center gap-2"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                <Avatar src={user.avatar} alt={user.name} size="sm" />
                <span className="hidden sm:block text-body-medium text-[var(--text-primary)]">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-lg z-50" role="menu" aria-label="User menu">
                  <div className="py-1">
                    <Link
                      href={settingsHref}
                      className="flex items-center gap-2 px-4 py-2 text-body text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-body text-[var(--color-danger)] hover:bg-[var(--bg-surface)]"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
