'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function InstitutionDashboard() {
  const router = useRouter();

  const metrics = [
    { label: 'Total Verified Students', value: '14,205', trend: '+12%', icon: 'group' },
    { label: 'Credentials Issued', value: '45,892', trend: '+8%', icon: 'workspace_premium' },
    { label: 'Pending Requests', value: '128', trend: '-3%', icon: 'timer' },
    { label: 'Verification Rate', value: '98.5%', trend: '+0.5%', icon: 'verified' },
  ];

  const recentActivity = [
    { id: 1, student: 'Alex Johnson', type: 'Degree Verification', date: '2 mins ago', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' },
    { id: 2, student: 'Maria Garcia', type: 'Transcript Request', date: '15 mins ago', status: 'Processing', statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' },
    { id: 3, student: 'James Smith', type: 'Skill Endorsement', date: '1 hour ago', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><span className="material-symbols-outlined text-sm">school</span></div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">Stanford Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/institution/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link href="/institution/requests" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
            <span className="material-symbols-outlined">inbox</span>
            Requests
          </Link>
          <Link href="/institution/issue" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-medium">
            <span className="material-symbols-outlined">send</span>
            Issue Credential
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
           <span className="font-bold text-lg text-slate-900 dark:text-white">Institution Portal</span>
           <button className="text-slate-500"><span className="material-symbols-outlined">menu</span></button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950">
           <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
             <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, Stanford Administration.</p>
           </div>
           <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="rounded-full"><span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span></Button>
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">SA</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${m.trend.startsWith('+') ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                    {m.trend}
                  </span>
                </div>
                <span className="text-3xl font-black text-slate-900 dark:text-white mb-1">{m.value}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Activity Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Credential Activity</h2>
                <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4 font-semibold">Student Name</th>
                      <th className="p-4 font-semibold">Request Type</th>
                      <th className="p-4 font-semibold">Time</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 rounded-tr-lg"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {recentActivity.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{row.student}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{row.type}</td>
                        <td className="p-4 text-slate-500">{row.date}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-lg">chevron_right</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          <Link href="/institution/dashboard" className="flex flex-col items-center gap-1 text-blue-600">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/institution/requests" className="flex flex-col items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined">inbox</span>
            <span className="text-[10px] font-semibold">Inbox</span>
          </Link>
          <Link href="/institution/issue" className="flex flex-col items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center -mt-6 border-4 border-slate-50 dark:border-slate-950">add</span>
            <span className="text-[10px] font-semibold">Issue</span>
          </Link>
          <Link href="/institution/settings" className="flex flex-col items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[10px] font-semibold">Settings</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}