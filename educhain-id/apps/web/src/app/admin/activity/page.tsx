'use client';

import React from 'react';
import Link from 'next/link';

const logs = [
  { id: '1', action: 'System Backup Started', admin: 'SYS_AUTO', time: '10 mins ago', type: 'System', status: 'Success' },
  { id: '2', action: 'API Key Revoked', admin: 'Root Admin (Rayyan)', time: '2 hours ago', type: 'Security', status: 'Warning' },
  { id: '3', action: 'Batch Credentials Issued (50)', admin: 'Stanford Admin', time: '4 hours ago', type: 'Operation', status: 'Success' },
  { id: '4', action: 'Failed Login Attempt', admin: 'Unknown', time: '1 day ago', type: 'Security', status: 'Critical' },
];

export default function AdminActivityPage() {
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
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">group</span> Network Hubs
              </Link>
              <Link href="/admin/activity" className="flex items-center gap-3 px-3 py-2 text-cyan-400 bg-cyan-500/10 rounded-lg">
                  <span className="material-symbols-outlined">history</span> Activity Log
              </Link>
          </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-800/50 bg-[#151822]/50 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-10 text-white">
            <h1 className="text-xl font-bold">System Activity Log</h1>
            <button className="px-4 py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-800 transition-colors">
                Export Logs
            </button>
        </header>

        <div className="p-8 flex-1 overflow-auto">
            <div className="bg-[#151822] rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800/50 flex gap-2">
                    <input type="text" placeholder="Search logs by keyword or ID..." className="bg-[#0F111A] border border-slate-700/50 rounded-xl px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:border-cyan-500/50 text-white placeholder-slate-500" />
                    <button className="px-4 py-2 bg-slate-800 text-white text-sm rounded-xl hover:bg-slate-700 transition">Filter</button>
                </div>
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#1A1D27] text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Initiator</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-semibold text-white">{log.action}</td>
                                <td className="px-6 py-4 text-slate-400">{log.type}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-800/50 border border-slate-700 px-2 py-1 rounded text-xs">{log.admin}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                        log.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                        'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

    </div>
  );
}