'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.replace('/auth/login');
        return;
      }

      // Sync user with backend (creates user record if first login)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/auth/sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({}),
          },
        );

        if (!res.ok) {
          console.error('Failed to sync user with backend');
        }

        const json = await res.json();
        const role = json?.data?.role;

        // Route based on role
        if (role === 'institution_admin') {
          router.replace('/institution/home');
        } else if (role === 'recruiter') {
          router.replace('/recruiter/home');
        } else {
          router.replace('/student/home');
        }
      } catch {
        // Fallback to student dashboard
        router.replace('/student/home');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-default)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        <p className="text-body text-[var(--text-secondary)]">Signing you in...</p>
      </div>
    </div>
  );
}
