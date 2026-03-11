'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Mock Data
const shortlisted = [
  { id: '1', name: 'Alina Smith', school: 'MIT', degree: 'M.S. Computer Science', status: 'Interviewing', appliedFor: 'Senior Blockchain Dev', match: 98, verified: true, avatar: 'AS' },
  { id: '2', name: 'Raj Patel', school: 'Stanford Univ.', degree: 'B.S. Software Eng.', status: 'Reviewing', appliedFor: 'Frontend Engineer', match: 85, verified: true, avatar: 'RP' },
];

export default function RecruiterShortlistPage() {
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
          <Link href="/recruiter/shortlist" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-semibold border-transparent">
            <span className="material-symbols-outlined">bookmarks</span>
            Shortlist
          </Link>
          <Link href="/recruiter/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
            <span className="material-symbols-outlined">insights</span>
            Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-8 md:py-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 gap-4">
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Shortlist</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your saved candidates and pipeline.</p>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:px-8 md:py-6 w-full">
            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Candidate</th>
                            <th className="px-6 py-4 hidden md:table-cell">Target Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {shortlisted.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold">
                                            {c.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.school}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell text-slate-600 dark:text-slate-300">
                                    {c.appliedFor}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                        c.status === 'Interviewing' 
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                        Message
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {shortlisted.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No candidates shortlisted yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}