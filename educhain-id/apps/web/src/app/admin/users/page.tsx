'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PlatformAdminUsers() {
  const users = [
    { id: 'usr_8af1', name: 'MIT Administration', type: 'Institution', status: 'Active', did: 'did:edu:mit:8f2a' },
    { id: 'usr_19b4', name: 'John Doe', type: 'Student', status: 'Active', did: 'did:edu:student:1x9v' },
    { id: 'usr_33c9', name: 'Fake University', type: 'Institution', status: 'Suspended', did: 'did:edu:fake:9z0p' },
    { id: 'usr_99x2', name: 'Sarah Connor', type: 'Student', status: 'Processing', did: 'Pending KYC' },
  ];

  return (
    <div className="flex h-screen bg-[#0F111A] text-slate-200 font-sans">
      
      {/* Sidebar - Dark theme for Super Admin */}
      <aside className="hidden md:flex flex-col w-64 bg-[#141723] border-r border-slate-800/60 sticky top-0">
        <div className="flex items-center gap-2 p-6 border-b border-slate-800/60">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white">
             <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">EduChain Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <span className="material-symbols-outlined">dashboard</span>
            Network Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
            <span className="material-symbols-outlined">people</span>
            User Management
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between p-4 md:px-8 md:py-6 bg-[#0F111A]/80 backdrop-blur-md border-b border-slate-800/60 gap-4">
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-white">Identity Registry</h1>
             <p className="text-slate-500 text-sm mt-1">Manage global DIDs, institutions, and student accounts.</p>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">Export CSV</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">Add Institution</Button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="bg-[#141723]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
             {/* Toolbar */}
             <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-[#1A1D27]/50">
               <div className="flex gap-2">
                 <select className="bg-[#0F111A] border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500">
                   <option>All Types</option>
                   <option>Institution</option>
                   <option>Student</option>
                 </select>
                 <select className="bg-[#0F111A] border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500">
                   <option>All Statuses</option>
                   <option>Active</option>
                   <option>Suspended</option>
                 </select>
               </div>
               
               <div className="w-full sm:w-64 relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
                 <input type="text" placeholder="Search name or ID..." className="w-full pl-9 pr-4 py-2 bg-[#0F111A] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
               </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#1A1D27] text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Global DID</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                {row.name.substring(0, 2)}
                              </div>
                              <div>
                                 <div className="font-bold text-white">{row.name}</div>
                                 <div className="text-xs text-slate-500 font-mono">{row.id}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${row.type === 'Institution' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-300'}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.did}</td>
                        <td className="px-6 py-4">
                          {row.status === 'Active' && <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active</span>}
                          {row.status === 'Suspended' && <span className="text-red-400 flex items-center gap-1.5 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Suspended</span>}
                          {row.status === 'Processing' && <span className="text-amber-400 flex items-center gap-1.5 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Processing</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white">Manage</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}