'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/providers/AuthProvider';

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userInfo = {
    name: user?.user_metadata?.full_name ?? user?.email ?? 'Admin',
    email: user?.email ?? '',
    avatar: user?.user_metadata?.avatar_url ?? null,
  };

  return (
    <DashboardLayout role="institution_admin" user={userInfo}>
      {children}
    </DashboardLayout>
  );
}
