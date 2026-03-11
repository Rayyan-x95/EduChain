'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PlatformAdminDashboard() {
  const metrics = [
    { label: 'Total Users', value: '1.2M', trend: '↑ 4.2%', icon: 'group', color: 'blue' },
    { label: 'Active Institutions', value: '450', trend: '↑ 2.1%', icon: 'account_balance', color: 'purple' },
    { label: 'Daily Blocks Synced', value: '14,021', trend: '↑ 1.1%', icon: 'hub', color: 'emerald' },
    { label: 'System Health', value: '99.9%', trend: 'Stable', icon: 'health_and_safety', color: 'blue' }
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
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
            <span className="material-symbols-outlined">dashboard</span>
            Network Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <span className="material-symbols-outlined">people</span>
            User Management
          </Link>
          <Link href="/admin/nodes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <span className="material-symbols-outlined">dns</span>
            Node Status
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header - Glassmorphic */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 md:px-8 md:py-4 bg-[#0F111A]/80 backdrop-blur-md border-b border-slate-800/60">
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-white">Master Control</h1>
           </div>
           <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex w-64 bg-[#1A1D27] border border-slate-700/50 rounded-xl px-3 py-1.5 focus-within:border-blue-500/50 transition-colors">
                <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
                <input type="text" placeholder="Search logs, DIDs..." className="bg-transparent border-none text-sm text-white w-full focus:outline-none placeholder-slate-500" />
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">notifications</span></Button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* Glass Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => (
              <div key={idx} className="bg-[#141723]/60 backdrop-blur-xl p-5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
                {/* Subtle gradient blob behind icon */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${m.color}-500/10 blur-2xl group-hover:bg-${m.color}-500/20 transition-colors`}></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-2 rounded-lg bg-${m.color}-500/10 text-${m.color}-400 ring-1 ring-${m.color}-500/20`}>
                     <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-[#0F111A] px-2 py-1 rounded-md border border-slate-800">
                    {m.trend}
                  </span>
                </div>
                <div className="relative z-10">
                   <h3 className="text-2xl md:text-3xl font-black text-white mb-1">{m.value}</h3>
                   <p className="text-sm font-medium text-slate-500">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dual Panel (Charts & Feed) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart Card */}
            <div className="lg:col-span-2 bg-[#141723]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">Network Throughput</h2>
                  <select className="bg-[#0F111A] border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none focus:ring-1 ring-blue-500/50">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
               </div>
               
               {/* Pure CSS/SVG Mock Chart Area */}
               <div className="h-64 mt-4 relative w-full border-b border-l border-slate-800 flex items-end justify-between px-2 pt-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between max-w-[calc(100%-1rem)] pointer-events-none">
                     <div className="border-t border-slate-800/50 w-full h-0"></div>
                     <div className="border-t border-slate-800/50 w-full h-0"></div>
                     <div className="border-t border-slate-800/50 w-full h-0"></div>
                     <div className="border-t border-slate-800/50 w-full h-0 z-0"></div>
                  </div>
                  
                  {/* Bars */}
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div key={i} className="w-[10%] bg-blue-500/20 hover:bg-blue-500/40 border-t border-r border-l border-blue-500/30 rounded-t-sm z-10 transition-colors relative group" style={{ height: `${h}%` }}>
                       {/* Tooltip */}
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {h * 123} txs
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* System Feed */}
            <div className="bg-[#141723]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col">
               <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Security Feed</h2>
               <div className="flex-1 space-y-4">
                  
                  <div className="flex gap-3">
                     <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20"><span className="material-symbols-outlined text-[16px]">verified</span></div>
                     <div>
                       <p className="text-sm text-slate-300"><span className="font-bold text-white">Stanford</span> issued 400 credentials in batch.</p>
                       <span className="text-xs text-slate-500">2 mins ago</span>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <div className="mt-1 w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20"><span className="material-symbols-outlined text-[16px]">warning</span></div>
                     <div>
                       <p className="text-sm text-slate-300"><span className="font-bold text-white">Node 0x4B</span> fell out of consensus.</p>
                       <span className="text-xs text-slate-500">14 mins ago</span>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20"><span className="material-symbols-outlined text-[16px]">person_add</span></div>
                     <div>
                       <p className="text-sm text-slate-300"><span className="font-bold text-white">1,024</span> new users registered today.</p>
                       <span className="text-xs text-slate-500">1 hour ago</span>
                     </div>
                  </div>

               </div>
               <Button variant="outline" className="w-full mt-4 text-xs border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">View All Logs</Button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}