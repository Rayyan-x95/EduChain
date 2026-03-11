'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function IssueCredentialPage() {
  const [studentId, setStudentId] = useState('');
  const [credType, setCredType] = useState('degree');
  const [title, setTitle] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans md:flex-row pb-20 md:pb-0">
      
      {/* Desktop Sidebar Stub */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Institution Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/institution/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium">
             <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          <Link href="/institution/issue" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold">
            <span className="material-symbols-outlined">send</span> Issue Credential
          </Link>
        </nav>
      </aside>

      {/* Main Form Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
        
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Issue Direct Credential</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Fill the details below. Creating this credential will automatically sign and push a hash to the EduChain network.
          </p>
        </div>

        <form className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
          
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Student DID or Email</label>
                   <Input 
                      placeholder="did:edu:..., or student@email.com" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Credential Category</label>
                   <select 
                     value={credType}
                     onChange={(e) => setCredType(e.target.value)}
                     className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-sm font-medium"
                   >
                     <option value="degree">Academic Degree</option>
                     <option value="certificate">Course Certificate</option>
                     <option value="skill">Skill Endorsement</option>
                     <option value="attendance">Proof of Attendance</option>
                   </select>
                </div>
             </div>

             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Achievement Title</label>
                <Input 
                  placeholder="e.g. Master of Science in Computer Science" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
             </div>

             <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea 
                  rows={3}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm"
                  placeholder="Additional context about this achievement..."
                />
             </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
             <Button type="button" variant="outline" className="sm:flex-1 h-12">Cancel</Button>
             <Button type="button" className="sm:flex-1 h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
               <span className="material-symbols-outlined text-[18px]">verified</span>
               Sign & Issue
             </Button>
          </div>
        </form>

      </main>

    </div>
  );
}