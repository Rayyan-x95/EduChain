'use client';

import React from 'react';
import Link from 'next/link';

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 md:pb-0 md:pl-20">
      
      {/* Mobile Top Header (can abstract this later) */}
      <header className="md:hidden sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-30 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
         <Link href="/groups" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
           <span className="material-symbols-outlined">arrow_back</span>
         </Link>
         <h1 className="font-bold text-lg text-slate-900 dark:text-white">Web3 Builders</h1>
         <div className="w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">more_vert</span>
         </div>
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
            <Link href="/groups" className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <span className="material-symbols-outlined">groups</span>
            </Link>
        </div>
      </aside>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Banner & Header */}
        <div className="relative rounded-3xl overflow-hidden mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-cyan-500"></div>
            <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end gap-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl -mt-12 md:-mt-16 flex items-center justify-center text-3xl font-bold text-slate-800 dark:text-white z-10 shrink-0">
                    W3
                </div>
                <div className="flex-1 mt-2 md:mt-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Web3 Builders Group</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Stanford Univ. • 128 Members • Public</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Joined
                    </button>
                </div>
            </div>
        </div>

        {/* Content Tabs area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                
                {/* Create Post */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0"></div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl px-4 py-3 text-slate-500 text-sm cursor-text border border-slate-200 dark:border-slate-800">
                        Share an update, paper, or code...
                    </div>
                </div>

                {/* Feed (Mock single post) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 font-bold p-1">JS</div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">Jill Smith</div>
                            <div className="text-xs text-slate-500">2 hours ago</div>
                        </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                        Just published the new smart contract standard implementation for identity verification! Would love some code review from the group.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">description</span>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">Identity_v2.sol</div>
                            <div className="text-xs text-slate-500">github.com/jill/contracts</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                        <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">thumb_up</span> 14
                        </button>
                        <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span> 3
                        </button>
                    </div>
                </div>

            </div>

            {/* Sidebar Data */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-3">About</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        A group for developers exploring Web3 protocols, Zero Knowledge proofs, and decentralized identity.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        Created Jan 2023
                    </div>
                </div>
            </div>

        </div>

      </main>
    </div>
  );
}