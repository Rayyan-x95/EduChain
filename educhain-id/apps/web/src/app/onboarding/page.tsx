'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TopAppBar } from '@/components/ui/TopAppBar';

export default function OnboardingWelcomePage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 overflow-x-hidden font-sans">
      <TopAppBar 
        showClose={true} 
        title="EduChain ID" 
        onClose={() => router.push('/')}
      />
      
      <div className="flex-1 flex flex-col justify-center px-6 container mx-auto">
        <div className="md:px-4 md:py-3 max-w-2xl mx-auto w-full">
          <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-blue-600/10 md:rounded-xl min-h-[320px] shadow-2xl shadow-blue-600/20 border border-slate-200 dark:border-slate-800"
               style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542451313056-b7c8e626645f?q=80&w=2000&auto=format&fit=crop")' }}>
            {/* Using an unsplash placeholder for the abstract 3d nodes */}
          </div>
        </div>
        
        <div className="max-w-md mx-auto text-center mt-10">
          <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-bold leading-tight pb-4">
            Welcome to EduChain ID
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed pb-8">
            Build your verified academic identity with blockchain-backed credentials and secure sharing.
          </p>
          
          <div className="flex w-full flex-row items-center justify-center gap-3 pb-10">
            <div className="h-2 w-6 rounded-full bg-blue-600"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          </div>
          
          <div className="flex flex-col gap-4 w-full px-4">
            <Button 
              size="lg" 
              className="group py-4 rounded-xl flex items-center justify-center gap-2 font-semibold"
              onClick={() => router.push('/onboarding/institution')}
            >
              Next
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Button>
            <Button 
              variant="ghost" 
              className="py-2 font-medium"
              onClick={() => router.push('/login')}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-10 bg-transparent"></div>
    </div>
  );
}