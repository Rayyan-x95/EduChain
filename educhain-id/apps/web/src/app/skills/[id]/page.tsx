'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';

// Dummy data to simulate fetching a skill by ID
const mockSkillDetail = {
  id: 'solidity',
  name: 'Solidity Smart Contracts',
  icon: 'terminal',
  isVerified: true,
  endorsements: 42,
  globalRank: 'Top 5%',
  endorsers: [
    { id: 1, name: 'Dr. Sarah Chen', role: 'Stanford CS Professor', isVerified: true, isExpert: true, initials: 'SC' },
    { id: 2, name: 'Alex Rodriguez', role: 'Lead Dev @ Ethereum', isVerified: true, isExpert: true, initials: 'AR' },
    { id: 3, name: 'Jamie Doe', role: 'Peer Student', isVerified: false, isExpert: false, initials: 'JD' },
    { id: 4, name: 'Prof. Alan Turing', role: 'Cryptography Lead', isVerified: true, isExpert: true, initials: 'AT' },
  ]
};

export default function SkillDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Skill Details" 
        showBack={true} 
        onBack={() => router.back()}
        rightAction={
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">share</span>
          </Button>
        }
        className="bg-slate-50 dark:bg-slate-950 z-10 border-none"
      />

      <div className="flex-1 overflow-y-auto w-full pb-24">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center pt-6 pb-8 px-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-slate-950 shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-500">{mockSkillDetail.icon}</span>
            </div>
            {mockSkillDetail.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[16px]">verified</span>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-1">
            {mockSkillDetail.name}
          </h1>
          {mockSkillDetail.isVerified && (
             <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
               <span className="material-symbols-outlined text-[14px]">check_circle</span>
               Verified by Institution
             </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="p-4 grid grid-cols-2 gap-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <span className="material-symbols-outlined text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform">thumb_up</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mockSkillDetail.endorsements}</span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">Endorsements</span>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center group hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <span className="material-symbols-outlined text-purple-500 text-3xl mb-2 group-hover:scale-110 transition-transform">public</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mockSkillDetail.globalRank}</span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">Global Class</span>
           </div>
        </div>

        {/* Endorsers List */}
        <div className="px-4 mt-2">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Endorsed By</h3>
             <span className="text-sm font-semibold text-blue-600 cursor-pointer">View All</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {mockSkillDetail.endorsers.map(endorser => (
              <div key={endorser.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                    {endorser.initials}
                  </div>
                  {endorser.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                       <span className="material-symbols-outlined text-white text-[10px]">check</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {endorser.name}
                    </h4>
                    {endorser.isExpert && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Expert</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{endorser.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          <Button className="w-full gap-2 text-md h-12 rounded-xl">
            <span className="material-symbols-outlined">thumb_up</span>
            Endorse this Skill
          </Button>
        </div>
      </div>

    </div>
  );
}