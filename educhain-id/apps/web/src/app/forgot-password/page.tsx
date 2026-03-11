'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      <TopAppBar 
        showBack={true} 
        onBack={() => router.back()}
        title="Forgot Password" 
      />

      <main className="flex-1 flex flex-col px-4 pt-10 pb-6 max-w-md mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset your password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-[280px] mx-auto">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        {/* Form elements */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full flex-1 flex flex-col">
            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 pl-1">Email Address</span>
                <Input 
                  type="email"
                  placeholder="name@university.edu"
                  required
                  className="rounded-xl h-14"
                  icon={<span className="material-symbols-outlined text-slate-400">mail</span>}
                />
              </label>
            </div>

            <div className="mt-auto pt-8 pb-4">
              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                className="py-4 h-auto rounded-xl font-bold shadow-lg shadow-blue-600/20"
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center text-center justify-center space-y-6">
            <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Check your email</h2>
              <p className="text-sm text-slate-500 max-w-[260px] mx-auto mt-2">
                We've sent password reset instructions to your email address.
              </p>
            </div>
            
            <div className="mt-auto w-full pt-8 pb-4">
              <Button 
                variant="outline"
                fullWidth 
                size="lg" 
                onClick={() => router.push('/login')}
                className="py-4 h-auto rounded-xl font-bold"
              >
                Return to Login
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}