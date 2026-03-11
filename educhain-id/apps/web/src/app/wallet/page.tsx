'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function WalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'credentials' | 'history'>('credentials');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Identity Wallet" 
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">settings</span>
          </Button>
        }
        className="bg-slate-50 dark:bg-slate-950 z-10 border-none" // No border for seamless blend with DID card area
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto w-full pb-20">
        
        {/* DID Card Section */}
        <div className="px-4 pb-6 pt-2 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-white shadow-lg shadow-slate-900/20">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-blue-500/10 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">EduChain DID</div>
                  <div className="font-mono text-sm tracking-widest bg-white/10 px-2 py-1 rounded inline-block">did:edu:12fa...9x4c</div>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                   {/* Placeholder for actual QR code */}
                  <span className="material-symbols-outlined text-3xl">qr_code_2</span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-8">
                 <div>
                    <h2 className="text-xl font-bold">John Doe</h2>
                    <p className="text-white/70 text-sm">Computer Science</p>
                 </div>
                 <div className="flex -space-x-2">
                    {/* Trust anchor icons */}
                    <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">ST</div>
                    <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">GO</div>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button className="flex-1 rounded-xl gap-2 font-semibold">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              Scan
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl bg-white dark:bg-slate-900 gap-2 font-semibold border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined">share</span>
              Share
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('credentials')}
            className={cn(
              "py-3 text-sm font-bold capitalize tracking-wide transition-all border-b-[3px]",
              activeTab === 'credentials' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            Credentials (3)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "py-3 text-sm font-bold capitalize tracking-wide transition-all border-b-[3px]",
              activeTab === 'history' 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 bg-white dark:bg-slate-950 min-h-[300px]">
          {activeTab === 'credentials' ? (
            <div className="space-y-4">
              {/* Mock Credential 1 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600">school</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">B.S. Computer Science</h4>
                  <p className="text-xs text-slate-500 truncate">Stanford University • Issued 2023</p>
                </div>
                <span className="material-symbols-outlined text-green-500">verified</span>
              </div>
              
              {/* Mock Credential 2 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-600">military_tech</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">AWS Cloud Architect</h4>
                  <p className="text-xs text-slate-500 truncate">Amazon Web Services • Valid till 2026</p>
                </div>
                <span className="material-symbols-outlined text-green-500">verified</span>
              </div>

               <Button variant="outline" className="w-full border-dashed border-2 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 py-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="material-symbols-outlined mr-2">add_circle</span>
                Add New Credential
              </Button>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
               {/* Activity Timeline Mock */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Identity Verified</div>
                        <time className="text-[10px] font-medium text-slate-500">Today</time>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">KYC process completed successfully.</div>
                  </div>
               </div>

               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Wallet Created</div>
                        <time className="text-[10px] font-medium text-slate-500">Oct 12</time>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">DID successfully anchored to blockchain.</div>
                  </div>
               </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/wallet" className="flex flex-col items-center gap-1 text-blue-600">
            <span className="material-symbols-outlined">badge</span>
            <span className="text-[10px] font-semibold">Identity</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-[10px] font-semibold">Alerts</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-semibold">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}