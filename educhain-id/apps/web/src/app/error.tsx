'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl shadow-xl">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-4">System Processing Error</h2>
        <p className="text-slate-500 dark:text-slate-400">
          We encountered an unexpected error while communicating with the EduChain network. Our engineering team has been notified.
        </p>
        
        {/* Optional dev-mode error detail hint */}
        {process.env.NODE_ENV === 'development' && (
           <p className="text-xs font-mono text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded-lg break-words text-left overflow-hidden">
             {error.message}
           </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            onClick={() => reset()} 
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
          >
            Try Again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl block text-center">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}