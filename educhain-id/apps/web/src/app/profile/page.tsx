'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';

export default function StudentProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Top Navbar */}
      <TopAppBar 
        title="Profile" 
        showBack={true} 
        onBack={() => router.back()}
        rightAction={
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">settings</span>
          </Button>
        }
        className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24 space-y-8 max-w-md mx-auto w-full">
        
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-4 border-white dark:border-slate-900 shadow-md">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" alt="Alex Chen" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-slate-900">
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Alex Chen</h1>
            <p className="text-sm font-semibold text-blue-600">Stanford University</p>
            <p className="text-xs text-slate-500">B.Tech Computer Science • Class of 2027</p>
          </div>
          
          <div className="flex items-center gap-3 pt-2 w-full">
            <Button variant="outline" className="flex-1 rounded-xl">Edit Profile</Button>
            <Button variant="secondary" className="flex-1 rounded-xl gap-2">
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share Profile
            </Button>
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 px-1">Core Skills</h3>
          <div className="flex flex-wrap gap-2">
            {['React.js', 'Python', 'Solidity', 'TypeScript', 'Node.js', 'UI/UX'].map(skill => (
              <span key={skill} className="px-3 py-1.5 bg-slate-200/50 dark:bg-slate-800 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Credentials Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Verified Credentials</h3>
            <button className="text-xs font-semibold text-blue-600">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Computer Science B.S.', sub: 'Stanford University • Issued 2024', icon: 'school' },
              { title: 'Ethereum Developer Cert', sub: 'Consensys Academy • Issued 2023', icon: 'workspace_premium' },
            ].map((cred, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{cred.icon}</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{cred.title}</span>
                  <span className="text-[10px] text-slate-500">{cred.sub}</span>
                </div>
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Featured Projects</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 snap-x no-scrollbar">
            {[
              { title: 'Decentralized Voting DApp', desc: 'Secure blockchain voting system.', tags: ['Solidity', 'React'] },
              { title: 'AI Study Assistant', desc: 'LLM tutor tool.', tags: ['Python', 'Next.js'] },
            ].map((proj, i) => (
              <div key={i} className="min-w-[240px] snap-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{proj.title}</h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{proj.desc}</p>
                <div className="flex gap-2 mt-auto">
                  {proj.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="space-y-3 pb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 px-1">Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Hackathon Winner', sub: 'ETH Denver 2024', icon: 'emoji_events', color: 'from-amber-400 to-orange-500' },
              { title: 'Top 1% Contributor', sub: 'GitHub Open Source', icon: 'military_tech', color: 'from-violet-400 to-fuchsia-500' },
            ].map((ach, i) => (
              <div key={i} className={`p-[1px] rounded-2xl bg-gradient-to-br ${ach.color}`}>
                <div className="bg-white dark:bg-slate-950 h-full w-full rounded-[15px] p-4 flex flex-col gap-2">
                  <span className={`material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-br ${ach.color}`}>
                    {ach.icon}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">{ach.title}</h5>
                    <span className="text-[10px] text-slate-500">{ach.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/credentials" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">workspace_premium</span>
            <span className="text-[10px] font-semibold">Id Cards</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-slate-500 relative -top-5">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-900 dark:text-white">Scan</span>
          </Link>
          <Link href="/discovery" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">language</span>
            <span className="text-[10px] font-semibold">Network</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-blue-600">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-semibold">Me</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}