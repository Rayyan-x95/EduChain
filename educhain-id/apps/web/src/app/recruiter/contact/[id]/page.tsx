'use client';

import React from 'react';
import Link from 'next/link';

export default function CandidateContactPage({ params }: { params: { id: string } }) {
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
          <Link href="/recruiter/shortlist" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-semibold">
            <span className="material-symbols-outlined">bookmarks</span>
            Shortlist
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
           <div className="flex items-center gap-4">
             <Link href="/recruiter/shortlist" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
               <span className="material-symbols-outlined">arrow_back</span>
             </Link>
             <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">Alina Smith</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Stanford Univ. • M.S. Computer Science</p>
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
            
            <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">New Message</h2>
                    <p className="text-sm text-slate-500 mt-1">Contact Alina regarding the Senior Blockchain Developer role.</p>
                </div>
                
                <form className="p-6 space-y-6" onSubmit={e => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                        <input type="text" defaultValue="Discussing your profile + Senior Blockchain Dev role" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                        <textarea rows={6} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white resize-none" defaultValue={"Hi Alina,\n\nI was very impressed by your verified credentials and background in Cryptography from ETH Zurich. We are currently looking for a Senior Blockchain Developer at our firm and your skill set looks like a 98% match for what we are building.\n\nWould you be open to a quick 15-minute introductory call next week?\n\nBest,\nRecruiter Name"}></textarea>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <Link href="/recruiter/shortlist" className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</Link>
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2">
                            Send Message <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                </form>
            </div>

        </div>
      </main>
    </div>
  );
}