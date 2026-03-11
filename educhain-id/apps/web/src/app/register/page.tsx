'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

type Role = 'student' | 'institution' | 'recruiter';

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans antialiased relative overflow-hidden">
      <div className="w-full max-w-[480px] space-y-8 py-12 z-10">
        {/* Header Section */}
        <div className="flex flex-col items-start space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create your EduChain account.</h1>
            <p className="text-slate-600 dark:text-slate-400">Join the ecosystem of verified talent.</p>
          </div>
        </div>

        {/* Registration Form */}
        <form className="space-y-6" onSubmit={handleRegister}>
          {/* User Role Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">I am a...</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'student', icon: 'person', label: 'Student' },
                { id: 'institution', icon: 'account_balance', label: 'Institution' },
                { id: 'recruiter', icon: 'work', label: 'Recruiter' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as Role)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                    selectedRole === role.id
                      ? "border-blue-600 bg-blue-600/10 text-blue-600"
                      : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-blue-600/50"
                  )}
                >
                  <span className="material-symbols-outlined">{role.icon}</span>
                  <span className="text-xs font-semibold">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100" htmlFor="full-name">Full Name</label>
              <Input
                id="full-name"
                placeholder="Enter your name"
                type="text"
                className="py-3.5 h-auto rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100" htmlFor="email">Email Address</label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                className="py-3.5 h-auto rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100" htmlFor="password">Password</label>
              <Input
                id="password"
                placeholder="Create a strong password"
                type="password"
                className="py-3.5 h-auto rounded-xl"
                required
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full rounded-xl py-4 h-auto text-sm font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Create Account
            </Button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="flex flex-col items-center space-y-4 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
          <div className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 w-full justify-center">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold">Privacy</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold">Terms</Link>
            <Link href="/help" className="text-xs text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest font-bold">Help</Link>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]"></div>
      <div className="fixed bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]"></div>
    </div>
  );
}