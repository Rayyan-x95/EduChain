'use client';

import React from 'react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-8 max-w-md mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-blue-600 p-[2px]">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Welcome back</span>
            <h1 className="text-lg font-bold">Alex Chen</h1>
          </div>
        </div>
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 space-y-8 max-w-md mx-auto w-full">
        
        {/* Virtual ID Card */}
        <section className="relative overflow-hidden z-10 w-full h-48 rounded-2xl p-6 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <div className="flex justify-between items-start text-white">
            <div className="flex flex-col">
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Stanford Univ.</span>
              <span className="text-xl font-bold">Alex Chen</span>
            </div>
            <span className="material-symbols-outlined text-3xl opacity-50">account_balance</span>
          </div>
          <div className="flex justify-between items-end text-white">
            <div className="flex flex-col gap-1">
              <span className="text-white/60 text-[10px] uppercase tracking-wider font-mono">DID / Blockchain ID</span>
              <span className="font-mono text-xs font-medium tracking-wide bg-black/20 px-2 py-1 rounded-md">did:edu:0x4f...3e91</span>
            </div>
            <div className="bg-white p-1 rounded-md">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=did:edu:0x4f...3e91" alt="QR" className="w-10 h-10" />
            </div>
          </div>
          
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col gap-1 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            </div>
            <span className="text-2xl font-bold">12</span>
            <span className="text-xs text-slate-500 font-medium">Verified Credentials</span>
            <span className="text-[10px] text-green-600 font-semibold bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded w-max mt-1">+2 this month</span>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col gap-1 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
            <span className="text-2xl font-bold">4</span>
            <span className="text-xs text-slate-500 font-medium">Ongoing Projects</span>
            <span className="text-[10px] text-green-600 font-semibold bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded w-max mt-1">+1 this week</span>
          </div>
        </section>

        {/* Activity Feed */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Recent Activity</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-4 shadow-sm hover:border-blue-600/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-500">school</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Stanford University</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Pending</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Issued 'B.S. CS' Degree</span>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">0x4f2...3e91</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-4 shadow-sm hover:border-blue-600/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-500">code_blocks</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Google Skills</span>
                  <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Endorsed</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Endorsed 'Python' expert skill</span>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">0x8a1...f0c2</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-blue-600">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/credentials" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">workspace_premium</span>
            <span className="text-[10px] font-semibold">Id Cards</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-slate-500 relative -top-5">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-900 dark:text-white">Scan</span>
          </Link>
          <Link href="/discovery" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">language</span>
            <span className="text-[10px] font-semibold">Network</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-semibold">Me</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}