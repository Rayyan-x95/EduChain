'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Mock Data
const candidates = [
  { id: '1', name: 'Alina Smith', school: 'MIT', degree: 'M.S. Computer Science', skills: ['React', 'Solidity', 'Rust'], match: 98, verified: true, avatar: 'AS' },
  { id: '2', name: 'Raj Patel', school: 'Stanford Univ.', degree: 'B.S. Software Eng.', skills: ['Node.js', 'Python', 'AWS'], match: 85, verified: true, avatar: 'RP' },
  { id: '3', name: 'Elena Kor', school: 'ETH Zurich', degree: 'Ph.D Cryptography', skills: ['Cryptography', 'Go', 'C++'], match: 74, verified: false, avatar: 'EK' },
];

const filters = ['All', 'High Match (>90%)', 'Verified Only', 'Engineering', 'Design'];

export default function RecruiterDiscoveryPage() {
  const [activeFilter, setActiveFilter] = useState('All');

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
          <Link href="/recruiter/discover" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-semibold border-transparent">
            <span className="material-symbols-outlined">person_search</span>
            Discover
          </Link>
          <Link href="/recruiter/shortlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
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
        
        {/* Header */}
        <header className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-8 md:py-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 gap-4">
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Discover Talent</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Find cryptographically-verified candidates.</p>
           </div>
           
           <div className="flex gap-2">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
                <input type="text" placeholder="Skills, roles, schools..." className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 xl:hidden"><span className="material-symbols-outlined">menu</span></Button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          
          {/* Filters */}
          <div className="px-4 md:px-8 pt-6 pb-2">
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
               {filters.map(f => (
                 <button
                   key={f}
                   onClick={() => setActiveFilter(f)}
                   className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                   {f}
                 </button>
               ))}
             </div>
          </div>

          {/* Candidate Grid */}
          <div className="p-4 md:px-8 md:py-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
             {candidates.map(candidate => (
               <div key={candidate.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                  
                  {/* Verified Badge */}
                  {candidate.verified && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      VERIFIED
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-200 dark:border-indigo-800">
                       {candidate.avatar}
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                         {candidate.name}
                       </h3>
                       <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{candidate.degree}</p>
                       <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                         <span className="material-symbols-outlined text-[14px]">school</span> {candidate.school}
                       </p>
                     </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold tracking-wide border border-slate-200 dark:border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Match Score</span>
                        <span className={`font-bold text-lg ${candidate.match >= 90 ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {candidate.match}%
                        </span>
                     </div>
                     <div className="flex gap-2">
                       <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700 text-slate-400 hover:text-purple-600">
                         <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                       </Button>
                       <Button className="h-9 px-4 rounded-xl text-xs font-bold gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                         View Profile <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                       </Button>
                     </div>
                  </div>
               </div>
             ))}
          </div>

        </div>
      </main>

    </div>
  );
}