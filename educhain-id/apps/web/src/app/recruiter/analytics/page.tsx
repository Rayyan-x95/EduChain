'use client';

import React from 'react';
import Link from 'next/link';

export default function RecruiterAnalyticsPage() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* Sidebar - Recruiter Theme */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0">
        <div className="flex items-center gap-2 p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white">
             <span className="material-symbols-outlined text-sm">radar</span>
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Talent Scout</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/recruiter/discover" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
            <span className="material-symbols-outlined">person_search</span>
            Discover
          </Link>
          <Link href="/recruiter/shortlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
            <span className="material-symbols-outlined">bookmarks</span>
            Shortlist
          </Link>
          <Link href="/recruiter/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-semibold">
            <span className="material-symbols-outlined">insights</span>
            Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-8 md:py-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Pipeline Analytics</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track hiring velocity and candidate sources.</p>
           </div>
           <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
               <span className="material-symbols-outlined text-[18px]">download</span> Export Report
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:px-8 md:py-6 w-full space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Viewed</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">1,204</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% this month
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Shortlisted</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">45</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contacted</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">28</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hired</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">4</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">star</span> Top 10%
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">Candidate Top Universities</h3>
                    <div className="space-y-4">
                        {/* Mock bars */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Stanford Univ.</span>
                                <span className="text-slate-500">32%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">MIT</span>
                                <span className="text-slate-500">25%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">ETH Zurich</span>
                                <span className="text-slate-500">15%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-400">stacked_bar_chart</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Detailed charts incoming</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-[200px]">More robust interactive visualizations will render here upon integration.</p>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}