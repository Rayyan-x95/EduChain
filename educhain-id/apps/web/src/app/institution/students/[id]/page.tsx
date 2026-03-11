'use client';

import React from 'react';
import Link from 'next/link';

export default function StudentVerificationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* Sidebar - Institution Theme */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white sticky top-0">
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
           <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
             <span className="material-symbols-outlined text-sm">account_balance</span>
           </div>
           <span className="font-bold text-lg tracking-tight">Institution Hub</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/institution/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </Link>
          <Link href="/institution/requests" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 font-semibold">
            <span className="material-symbols-outlined">how_to_reg</span>
            Requests
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 md:h-20 flex items-center px-4 md:px-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
           <div className="flex items-center gap-4">
             <Link href="/institution/requests" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
               <span className="material-symbols-outlined">arrow_back</span>
             </Link>
             <h1 className="text-xl font-bold text-slate-900 dark:text-white">Review Request: #REQ-1092</h1>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* User Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
                        JD
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">John Doe</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Student ID: STD-9812739</p>
                            </div>
                            <span className="w-fit bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Pending Review
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Requested Credential</span>
                                <span className="font-medium text-slate-900 dark:text-white">B.S. Computer Science</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Graduation Year</span>
                                <span className="font-medium text-slate-900 dark:text-white">2024</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Email Match</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified (.edu)
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Identity Wallet</span>
                                <span className="font-mono text-slate-600 dark:text-slate-400 text-xs truncate">0x9aF...21Bd</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database Record Matching */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">database</span> Internal Records Match
                    </h3>
                    
                    <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">verified_user</span>
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-medium text-sm">Valid record found for <strong>John Doe</strong> in Registrar DB.</p>
                            <p className="text-slate-500 text-xs mt-1">Degree fulfilled all requirements as of May 12, 2024.</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-white/5">
                        <span className="material-symbols-outlined text-[20px]">check</span> Approve & Mint to Chain
                    </button>
                    <button className="flex-1 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">close</span> Decline Request
                    </button>
                </div>
            </div>
        </div>
      </main>

    </div>
  );
}