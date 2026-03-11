'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';

// Mock Achievement Data
const mockAchievement = {
  id: '1',
  title: 'Advanced Smart Contract Security',
  category: 'Specialization',
  issuer: 'Stanford University',
  status: 'ACTIVE',
  description: 'Awarded to students who have successfully demonstrated mastery in recognizing, exploiting, and securing vulnerabilities in Ethereum smart contracts using Solidity and Rust.',
  issueDate: 'October 12, 2025',
  expiryDate: 'Never',
  credentialId: 'SC-SEC-9941X',
  type: 'Degree Equivalent',
  skills: ['Solidity', 'Rust', 'Smart Contract Auditing', 'Truffle', 'Hardhat']
};

export default function AchievementDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="" 
        showBack={true} 
        onBack={() => router.back()}
        rightAction={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">share</span>
            </Button>
            <Button variant="ghost" size="icon">
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">more_vert</span>
            </Button>
          </div>
        }
        className="bg-slate-50 dark:bg-slate-950 z-10 border-none"
      />

      <div className="flex-1 overflow-y-auto w-full pb-24">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center pt-2 pb-6 px-4">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-[2rem] rotate-3 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-lg border border-blue-200 dark:border-blue-800">
              <span className="material-symbols-outlined text-7xl text-blue-600 dark:text-blue-500 transform -rotate-3">workspace_premium</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-sm z-10">
              <span className="material-symbols-outlined text-white text-xl">verified</span>
            </div>
          </div>
          
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">
            {mockAchievement.category}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center leading-tight mb-2">
            {mockAchievement.title}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Issued by <span className="text-slate-800 dark:text-slate-200 font-semibold">{mockAchievement.issuer}</span>
          </p>
        </div>

        {/* Status Banner */}
        <div className="mx-4 mb-8 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <span className="material-symbols-outlined text-lg">shield_locked</span>
            <span className="text-sm font-semibold">Blockchain Verified</span>
          </div>
          <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-widest">
            {mockAchievement.status}
          </span>
        </div>

        {/* Content Section */}
        <div className="px-4 space-y-6">
           <div className="space-y-2">
             <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Description</h3>
             <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
               {mockAchievement.description}
             </p>
           </div>

           {/* Metadata Grid */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</span>
                 <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{mockAchievement.issueDate}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</span>
                 <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{mockAchievement.expiryDate}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Credential ID</span>
                 <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">{mockAchievement.credentialId}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</span>
                 <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{mockAchievement.type}</span>
              </div>
           </div>

           {/* Skills Demonstrated */}
           <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Skills Verified</h3>
              <div className="flex flex-wrap gap-2">
                 {mockAchievement.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {skill}
                    </span>
                 ))}
              </div>
           </div>
        </div>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-safe grid grid-cols-2 gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        <Button variant="outline" className="w-full h-12 rounded-xl text-slate-700 dark:text-slate-300 font-semibold gap-2 border-2">
          <span className="material-symbols-outlined">download</span>
          Download PDF
        </Button>
        <Button className="w-full h-12 rounded-xl font-semibold gap-2 shadow-lg shadow-blue-500/30">
          <span className="material-symbols-outlined">add_to_home_screen</span>
          Add to Wallet
        </Button>
      </div>

    </div>
  );
}