'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';

interface Skill {
  name: string;
  endorsements: number;
  level: string;
  endorsedBy?: { name: string; avatar?: string }[];
}

const mockTopSkills: Skill[] = [
  { name: 'Solidity Smart Contracts', endorsements: 42, level: 'Expert', endorsedBy: [{name: 'A'}, {name: 'B'}, {name: 'C'}] },
  { name: 'React / Next.js', endorsements: 38, level: 'Advanced', endorsedBy: [{name: 'X'}, {name: 'Y'}] },
  { name: 'Cryptography', endorsements: 15, level: 'Intermediate' }
];

const mockOtherSkills: Skill[] = [
  { name: 'TypeScript', endorsements: 25, level: 'Advanced' },
  { name: 'Node.js', endorsements: 22, level: 'Advanced' },
  { name: 'Python', endorsements: 18, level: 'Intermediate' },
  { name: 'UI/UX Design', endorsements: 12, level: 'Intermediate' },
  { name: 'Figma', endorsements: 10, level: 'Intermediate' },
];

export default function SkillsPage() {
  const router = useRouter();

  const renderBadge = (level: string) => {
    switch(level) {
      case 'Expert': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Expert</span>;
      case 'Advanced': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Advanced</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{level}</span>;
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Skills & Endorsements" 
        showBack={true} 
        onBack={() => router.back()}
        className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto w-full p-4 pb-24 space-y-6">
        
        {/* Top Skills Section */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Top Skills</h2>
              <Button variant="ghost" size="sm" className="text-blue-600 font-semibold h-8 px-2">Edit</Button>
           </div>
           
           <div className="space-y-3">
              {mockTopSkills.map((skill, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-md">{skill.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderBadge(skill.level)}
                        <span className="text-xs text-slate-500 font-medium">·</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px] text-blue-500">thumb_up</span>
                           {skill.endorsements} endorsements
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Endorsers Avatars (Mock) */}
                  {skill.endorsedBy && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex -space-x-2">
                        {skill.endorsedBy.map((e, i) => (
                          <div key={i} className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {e.name}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500">+ highly skilled peers</span>
                    </div>
                  )}
                </div>
              ))}
           </div>
        </div>

        {/* Other Skills */}
        <div>
           <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Other Skills</h2>
           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
              {mockOtherSkills.map((skill, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{skill.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                       {skill.endorsements} endorsements
                    </div>
                  </div>
                  {renderBadge(skill.level)}
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <button className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 z-20">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

    </div>
  );
}