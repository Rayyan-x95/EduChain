'use client';

import React from 'react';
import Link from 'next/link';

export default function VerifyItemPage({ params }: { params: { id: string } }) {
  // Mock data simulation based on ID (normally fetched from server)
  const isVerified = params.id !== 'failed';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      {/* Mini header */}
      <header className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-sm">link</span>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">EduChain ID</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center">
            
            {isVerified ? (
                <>
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl text-emerald-500">verified</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Credential Verified</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">This record accurately reflects data stored on the blockchain and originates from an authorized institution.</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left space-y-4 mb-8">
                        <div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Recipient</div>
                            <div className="font-bold text-slate-900 dark:text-white">John Doe</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Credential</div>
                            <div className="font-bold text-slate-900 dark:text-white">B.S. in Computer Science</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Stanford University</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Issued Date</div>
                            <div className="font-medium text-slate-900 dark:text-white">May 15, 2024</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tx Hash</div>
                            <div className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mt-1 border border-blue-100 dark:border-blue-900/30">
                                0x71a...9b42fc0
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                     <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl text-red-500">error</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">This credential could not be verified on the network. It may have been revoked, tampered with, or does not exist.</p>
                    
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 text-left mb-8">
                        <p className="text-sm text-red-800 dark:text-red-400 font-medium text-center">
                            Record mismatch or Invalid Signature.
                        </p>
                    </div>
                </>
            )}

            <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-colors">
                View on Explorer
            </button>
            <Link href="/" className="block mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Back to Home
            </Link>
        </div>
      </main>

    </div>
  );
}