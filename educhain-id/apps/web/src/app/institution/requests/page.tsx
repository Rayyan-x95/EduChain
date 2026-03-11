'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function VerificationRequests() {
  const pendingRequests = [
    { id: 'REQ-9102', student: 'Sarah Connor', studentId: 'STD-1992', type: 'Credit Transfer Verification', submitted: 'Oct 24, 2025' },
    { id: 'REQ-9103', student: 'John Doe', studentId: 'STD-8831', type: 'Skill Endorsement Check', submitted: 'Oct 24, 2025' },
    { id: 'REQ-9104', student: 'Emma Wilson', studentId: 'STD-2910', type: 'Alumni Status Sync', submitted: 'Oct 23, 2025' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans md:flex-row pb-20 md:pb-0">
      
      {/* Desktop Sidebar Stub */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Institution Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/institution/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium">
             <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          <Link href="/institution/requests" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold">
            <span className="material-symbols-outlined">inbox</span> Requests
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="mb-8 mt-2 md:mt-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Verification Requests</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and approve incoming credential anchoring requests.</p>
          </div>
          <div className="hidden md:flex gap-3">
             <Button variant="outline" className="gap-2"><span className="material-symbols-outlined">filter_list</span> Filter</Button>
          </div>
        </header>

        {/* Action Bar (Mobile) */}
        <div className="mb-4 flex gap-2 md:hidden">
            <div className="relative flex-1">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
               <input type="text" placeholder="Search ID or Name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button variant="outline" size="icon" className="shrink-0"><span className="material-symbols-outlined">filter_list</span></Button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {pendingRequests.map(req => (
            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm group">
               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{req.id}</span>
                       <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">PENDING</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{req.student}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">ID: {req.studentId} • {req.type}</p>
                    <p className="text-xs text-slate-500 mt-2">Submitted on {req.submitted}</p>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                     <Button className="flex-1 sm:flex-none uppercase tracking-wider text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Approve
                     </Button>
                     <Button variant="outline" className="flex-1 sm:flex-none uppercase tracking-wider text-xs font-bold gap-1 text-slate-600 border-slate-300 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                        <span className="material-symbols-outlined text-[16px]">cancel</span> Reject
                     </Button>
                  </div>
               </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}