'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';

export default function StudentManualPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-2xl w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Student Manual" 
        showBack={true} 
        onBack={() => router.back()}
        className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800"
      />

      <div className="flex-1 overflow-y-auto w-full p-6 lg:p-10 pb-20 no-scrollbar">
        
        {/* Intro */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            Welcome to EduChain ID
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            This visual manual guides you through using your decentralized student identity. Discover how to manage credentials, connect with institutions, and anchor your academic history to the blockchain securely.
          </p>
        </div>

        {/* Section 1: Verifiable Credentials */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 relative pl-4 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-blue-600 before:rounded-full">
            1. Understanding Credentials
          </h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm mb-4">
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
               Credentials represent your academic achievements, such as degrees, skills, or specific course completions. They carry distinct statuses:
             </p>
             <ul className="space-y-4">
                <li className="flex items-start gap-4">
                   <div className="shrink-0 mt-0.5">
                     <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded border border-green-200 dark:border-green-800/50">ACTIVE</span>
                   </div>
                   <div>
                     <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-0.5">Active & Verified</strong>
                     <span className="text-xs text-slate-500">The credential has been securely written to the blockchain by your institution and is cryptographically valid.</span>
                   </div>
                </li>
                <li className="flex items-start gap-4">
                   <div className="shrink-0 mt-0.5">
                     <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded border border-amber-200 dark:border-amber-800/50">PENDING</span>
                   </div>
                   <div>
                     <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-0.5">Pending Signature</strong>
                     <span className="text-xs text-slate-500">The institution is currently verifying the data before signing and sealing the credential.</span>
                   </div>
                </li>
                <li className="flex items-start gap-4">
                   <div className="shrink-0 mt-0.5">
                     <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded border border-red-200 dark:border-red-800/50">REVOKED</span>
                   </div>
                   <div>
                     <strong className="block text-sm text-slate-900 dark:text-slate-100 mb-0.5">Revoked</strong>
                     <span className="text-xs text-slate-500">The credential was invalidated by the issuer (e.g. expiration or administrative action).</span>
                   </div>
                </li>
             </ul>
          </div>
        </section>

        {/* Section 2: Identity Wallet */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 relative pl-4 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-blue-600 before:rounded-full">
            2. The Identity Wallet
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Your Identity Wallet holds your DID (Decentralized Identifier). It functions like a digital, cryptographic folder that proves you are who you say you are.
          </p>
          <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3">
             <div className="text-sm text-slate-600 dark:text-slate-400">
               <strong className="text-slate-900 dark:text-slate-200">Share QR Code:</strong> Use the QR code at the top of your wallet page for instant in-person verification by recruiters.
             </div>
             <div className="text-sm text-slate-600 dark:text-slate-400">
               <strong className="text-slate-900 dark:text-slate-200">Activity History:</strong> Switch to the "Activity" tab on your wallet page to audit when your credentials were last accessed or updated.
             </div>
          </div>
        </section>

        {/* Privacy Note */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 mb-10 text-center">
           <span className="material-symbols-outlined text-3xl text-blue-500 mb-2">admin_panel_settings</span>
           <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Zero-Knowledge Privacy</h3>
           <p className="text-xs text-slate-500 max-w-sm mx-auto">
             When you share a credential, you only share the required cryptographic proof. Institutions cannot see your other held credentials unless explicitly shared.
           </p>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400">EduChain ID • Student Documentation v1.0</p>
        </div>
      </div>
    </div>
  );
}