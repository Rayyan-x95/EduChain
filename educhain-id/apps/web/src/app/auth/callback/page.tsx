'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { appHomeForRole, syncBackendUser } from '@/lib/auth-flow';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.access_token) {
        router.replace('/auth/login');
        return;
      }

      try {
        const syncResult = await syncBackendUser(session.access_token);
        const destination =
          syncResult.is_new || syncResult.isNew
            ? '/onboarding/profile'
            : appHomeForRole(syncResult.role);
        router.replace(destination);
      } catch {
        router.replace('/dashboard');
      }
    }

    void handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-default)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        <p className="text-body text-[var(--text-secondary)]">Finishing sign-in...</p>
      </div>
    </div>
  );
}
