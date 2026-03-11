'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminKeysPage() {
  return (
    <div className="flex h-screen bg-[#0F111A] text-slate-300 font-sans">
      
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-[#151822] border-r border-slate-800/50 hidden lg:flex flex-col">
          <div className="p-6">
              <div className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                 EduChain Core
              </div>
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">dashboard</span> Overview
              </Link>
              <Link href="/admin/keys" className="flex items-center gap-3 px-3 py-2 text-cyan-400 bg-cyan-500/10 rounded-lg">
                  <span className="material-symbols-outlined">key</span> Key Management
              </Link>
              <Link href="/admin/activity" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">history</span> Activity Log
              </Link>
          </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-800/50 bg-[#151822]/50 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-10 text-white">
            <h1 className="text-xl font-bold">API & Node Keys</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span> Generate Key
            </button>
        </header>

        <div className="p-8 flex-1 overflow-auto space-y-8">
            
            <div className="bg-[#1A1D27] p-6 rounded-2xl border border-rose-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className="material-symbols-outlined text-6xl text-red-500/10">warning</span>
                </div>
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">security</span> Root Key Status
                </h3>
                <p className="text-slate-400 text-sm mb-4 max-w-xl">
                    The Smart Contract upgrade key is currently active. Treat this key with utmost security. Never expose the private key payload outside of secure environment variables.
                </p>
                <div className="flex bg-[#0F111A] rounded-lg border border-slate-800/50 p-3 max-w-xl items-center gap-3">
                    <span className="font-mono text-sm text-slate-500 truncate flex-1">0x892aF.......................3Fb71</span>
                    <button className="text-cyan-500 hover:text-cyan-400 px-2 text-sm font-bold">Reveal</button>
                </div>
            </div>

            <div>
                <h2 className="text-white font-bold text-lg mb-4">Institution Issuance Keys</h2>
                <div className="bg-[#151822] rounded-2xl border border-slate-800/50 overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#1A1D27] text-slate-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Institution / Entity</th>
                                <th className="px-6 py-4">Key ID (Public)</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-semibold text-white">Stanford Univ. Node</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">edu_key_8fa2...901</td>
                                <td className="px-6 py-4 text-slate-400">Mar 01, 2026</td>
                                <td className="px-6 py-4">
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-rose-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider">Revoke</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-semibold text-white">MIT Verifier Proxy</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">edu_key_b2f9...2aa</td>
                                <td className="px-6 py-4 text-slate-400">Jan 15, 2026</td>
                                <td className="px-6 py-4">
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-rose-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider">Revoke</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </main>

    </div>
  );
}