'use client';

import React from 'react';
import Link from 'next/link';

export default function CredentialDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 md:pb-0 md:pl-20">
      
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-30 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
         <Link href="/wallet" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
           <span className="material-symbols-outlined">arrow_back</span>
         </Link>
         <h1 className="font-bold text-lg text-slate-900 dark:text-white">Credential</h1>
      </header>

      {/* Desktop Sidebar (Mini) */}
      <aside className="hidden md:flex flex-col w-20 fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-4 items-center justify-between z-30">
        <div className="flex flex-col gap-6">
            <Link href="/" className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-lg">link</span>
            </Link>
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 mx-auto" />
            <Link href="/dashboard" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">home</span>
            </Link>
            <Link href="/wallet" className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <span className="material-symbols-outlined">account_balance_wallet</span>
            </Link>
        </div>
      </aside>

      <main className="max-w-3xl mx-auto p-4 md:p-8">
        
        {/* Title row */}
        <div className="flex justify-between items-start mb-6 md:mb-8 pt-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">B.S. Computer Science</h1>
                <p className="text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <span className="material-symbols-outlined text-[18px]">verified</span> Validated on EduChain
                </p>
            </div>
            <div className="flex gap-2">
                <button className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">ios_share</span>
                </button>
            </div>
        </div>

        {/* Certificate Display */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-slate-700/50">
            {/* Decal */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-start relative z-10 mb-16">
                <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Issuer</div>
                    <div className="text-xl font-bold">Stanford University</div>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-3xl">school</span>
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Recipient</div>
                <div className="text-2xl font-normal mb-8">Rayyan Ahmed</div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Issued Date</div>
                        <div className="font-mono text-sm">May 15, 2024</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Credential ID</div>
                        <div className="font-mono text-sm">#10294-BSCS</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Technical Details */}
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">On-Chain Metadata</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm">
                <span className="text-slate-500 font-medium">Transaction Hash</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 break-all bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    0x71a2b9f3e4...8d9b42fc0
                </span>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm">
                <span className="text-slate-500 font-medium">Block Height</span>
                <span className="font-mono text-slate-900 dark:text-white">18449021</span>
            </div>
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm">
                <span className="text-slate-500 font-medium">Smart Contract</span>
                <span className="font-mono text-slate-900 dark:text-white break-all">
                    0xEDu...b94F
                </span>
            </div>
        </div>

      </main>
    </div>
  );
}