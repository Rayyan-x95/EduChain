'use client';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
            {/* Lottie or CSS Spinner */}
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">
                Syncing with EduChain Network...
            </p>
        </div>
    </div>
  );
}