'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#111621] font-sans selection:bg-blue-500/30">
      
      {/* Basic Mock Header for standalone 404 page */}
      <header className="w-full bg-white/80 dark:bg-[#111621]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">link</span>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">EduChain ID</span>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center relative overflow-hidden">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Main Error Block */}
          <div className="flex items-center justify-center gap-2 lg:gap-4 mb-4 text-blue-600 dark:text-blue-500">
            <span className="text-7xl lg:text-9xl font-black tracking-tighter">4</span>
            <span className="material-symbols-outlined text-7xl lg:text-9xl animate-pulse">cloud_off</span>
            <span className="text-7xl lg:text-9xl font-black tracking-tighter">4</span>
          </div>
          
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-lg mx-auto">
            The credential or page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto px-8 py-6 rounded-xl text-lg gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
              <span className="material-symbols-outlined">home</span>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto px-8 py-6 rounded-xl text-lg gap-2 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Quick Links</h3>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
               <Link href="/wallet" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
                 <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">account_balance_wallet</span>
                 Identity Wallet
               </Link>
               <Link href="/settings" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
                 <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">settings</span>
                 Account Settings
               </Link>
               <Link href="/manual" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group">
                 <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">help_center</span>
                 Student Manual
               </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}