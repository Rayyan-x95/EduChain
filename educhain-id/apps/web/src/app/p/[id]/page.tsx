'use client';

import React from 'react';
import Link from 'next/link';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';

export default function PublicProfilePage() {

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Top Navbar */}
      <TopAppBar 
        title="PUBLIC PROFILE" 
        showBack={false} 
        rightAction={
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">share</span>
          </Button>
        }
        className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-16 space-y-10 max-w-md mx-auto w-full">
        
        {/* Profile Hero */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 border-[6px] border-white dark:border-slate-900 shadow-xl">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop" alt="Alex Chen" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-[3px] border-white dark:border-slate-900 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Alex Chen</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Computer Science Student at Stanford
            </p>
            <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Verified Profile
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full pt-4">
            <Button className="flex-1 rounded-xl gap-2 h-12 shadow-lg shadow-blue-600/20">
              <span className="material-symbols-outlined">description</span>
              Resume PDF
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl gap-2 h-12">
              <span className="material-symbols-outlined">link</span>
              Copy Link
            </Button>
          </div>
        </section>

        {/* Bio Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
            <span className="material-symbols-outlined text-blue-600">person</span>
            <h3 className="font-bold">Professional Bio</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Passionate software engineer specializing in distributed systems, zero-knowledge proofs, and decentralized identity. Active contributor to open-source Ethereum tools and currently researching scalable consensus algorithms at Stanford.
          </p>
        </section>

        {/* Credentials (Horizontal Scroll) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider">Verified Credentials</h3>
            <button className="text-xs font-semibold text-blue-600">View All</button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x no-scrollbar">
            {[
              { title: 'B.S. Computer Science', org: 'Stanford University', date: 'Exp. May 2027', verified: true, img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
              { title: 'Ethereum Dev Cert', org: 'Consensys', date: 'Aug 2023', verified: true, img: 'https://images.unsplash.com/photo-1622630998477-20b41cd0e0a1?w=100&h=100&fit=crop' }
            ].map((cred, i) => (
              <div key={i} className="min-w-[260px] snap-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl mb-4 border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <img src={cred.img} alt={cred.org} className="w-full h-full object-cover" />
                </div>
                {cred.verified && (
                  <div className="absolute top-5 right-5 bg-green-100 dark:bg-green-900/30 text-green-600 w-6 h-6 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                  </div>
                )}
                <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{cred.title}</h4>
                <p className="text-xs text-slate-500 mb-2">{cred.org}</p>
                <div className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 inline-block">
                  {cred.date}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects (Vertical Stack) */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider px-1">Featured Projects</h3>
          <div className="flex flex-col gap-4">
            {[
              { title: 'Decentralized Voting DApp', desc: 'A secure, anonymous voting system leveraging ZK-SNARKs and Ethereum L2 scaling solutions.', tags: ['Solidity', 'TypeScript', 'Foundry'] },
              { title: 'Academic Credential Wallet', desc: 'Mobile-first PWA for storing and presenting W3C Verifiable Credentials using decentralized identifiers.', tags: ['React Native', 'Node.js'] }
            ].map((proj, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                  <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{proj.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Endorsements */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider px-1">Skills & Endorsements</h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { skill: 'Smart Contract Dev', count: 42 },
              { skill: 'React / Next.js', count: 28 },
              { skill: 'Distributed Systems', count: 15 }
            ].map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.skill}</span>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(n => (
                       <img key={n} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 z-10 relative" src={`https://i.pravatar.cc/100?img=${i * 3 + n}`} alt="Avatar" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    +{item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Footer */}
        <footer className="pt-8 text-center opacity-70">
          <div className="inline-flex items-center gap-2 justify-center mb-2">
            <div className="size-6 bg-blue-600 rounded flex items-center justify-center text-white">
              <span className="text-xs font-bold tracking-tighter">E</span>
            </div>
            <span className="text-xs font-bold text-slate-500 tracking-wider">POWERED BY EDUCHAIN ID</span>
          </div>
          <p className="text-[10px] text-slate-400">Verifying the future of academic achievements.</p>
        </footer>

      </main>
    </div>
  );
}