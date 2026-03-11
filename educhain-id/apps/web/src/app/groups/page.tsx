'use client';

import React from 'react';
import Link from 'next/link';

const groups = [
  { id: '1', name: 'Web3 Builders', members: 128, type: 'Public', description: 'Exploring smart contract protocols and Zero Knowledge logic.', category: 'Engineering' },
  { id: '2', name: 'UI/UX Innovators', members: 84, type: 'Private', description: 'Design reviews and critique for spatial computing interfaces.', category: 'Design' },
  { id: '3', name: 'Data Science Hub', members: 215, type: 'Public', description: 'Python, R, and Machine Learning research papers.', category: 'Data' },
];

export default function GroupsDirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 md:pb-0 md:pl-20">
      
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-30 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
         <h1 className="font-bold text-xl text-slate-900 dark:text-white">Groups</h1>
         <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-full">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">search</span>
         </div>
      </header>

      {/* Desktop Sidebar (Mini) */}
      <aside className="hidden md:flex flex-col w-20 fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-4 items-center justify-between z-30">
        <div className="flex flex-col gap-6 items-center">
            <Link href="/" className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-lg">link</span>
            </Link>
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
            <Link href="/dashboard" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">home</span>
            </Link>
            <Link href="/groups" className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <span className="material-symbols-outlined">groups</span>
            </Link>
        </div>
      </aside>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Collaboration Groups</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Join communities, share research, and collaborate.</p>
            </div>
            <div className="flex gap-3">
                <div className="relative hidden md:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input type="text" placeholder="Search groups..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span> Create Group
                </button>
            </div>
        </div>

        {/* Categories/Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
            <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 whitespace-nowrap">All Groups</button>
            <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap">My Groups</button>
            <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap">Engineering</button>
            <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap">Design</button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
                <Link key={group.id} href={`/groups/${group.id}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all relative overflow-hidden block">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {group.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {group.type}
                        </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {group.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
                        {group.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            {group.members} Members
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                            Join <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                        </span>
                    </div>
                </Link>
            ))}
        </div>

      </main>

    </div>
  );
}