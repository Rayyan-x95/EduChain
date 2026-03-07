'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { BottomTabBar } from '@/components/organisms/BottomTabBar';
import { useAuth } from '@/providers/AuthProvider';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userInfo = {
    name: user?.user_metadata?.full_name ?? user?.email ?? 'Student',
    email: user?.email ?? '',
    avatar: user?.user_metadata?.avatar_url ?? null,
  };

  return (
    <DashboardLayout role="student" user={userInfo}>
      <div className="pb-16 lg:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </DashboardLayout>
  );
}
