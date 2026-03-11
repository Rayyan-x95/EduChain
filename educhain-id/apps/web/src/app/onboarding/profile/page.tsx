'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfileSetupPage() {
  const router = useRouter();

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden font-sans">
      
      <TopAppBar 
        showBack={true} 
        onBack={() => router.back()} 
        title="Profile Setup" 
      />

      {/* Progress Indicator */}
      <div className="flex flex-col gap-3 p-6 max-w-xl mx-auto w-full z-10">
        <div className="flex gap-6 justify-between items-end">
          <div className="flex flex-col">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Step 3 of 4</span>
            <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold">Almost there!</p>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">75% Complete</p>
        </div>
        <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-2 w-full overflow-hidden flex">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: '75%' }}></div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col w-full max-w-xl mx-auto px-6 py-4 gap-8 z-10">
        
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer inline-block">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop')" }}
            >
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-950 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-900 dark:text-slate-100 text-xl font-bold">Upload Photo</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Recommended: Square JPG or PNG</p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleComplete} className="flex flex-col gap-6">
          {/* Bio */}
          <label className="flex flex-col w-full gap-2">
            <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Bio</span>
            <textarea 
              className="block w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 min-h-[120px] placeholder:text-slate-400 dark:placeholder:text-slate-600 p-4 text-base transition-colors" 
              placeholder="Tell your classmates a bit about yourself, your interests, or what you're looking to learn..."
            ></textarea>
          </label>
          
          {/* Major */}
          <label className="flex flex-col w-full gap-2">
            <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Academic Major</span>
            <Input 
              icon={<span className="material-symbols-outlined text-slate-400">school</span>}
              placeholder="e.g. Computer Science"
              type="text"
              className="bg-white dark:bg-slate-900/50 h-14 rounded-xl text-base"
            />
          </label>
          
          {/* Graduation Year */}
          <label className="flex flex-col w-full gap-2">
            <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">Expected Graduation Year</span>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">calendar_today</span>
              <select className="block w-full pl-12 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 p-4 text-base appearance-none transition-colors">
                <option value="" disabled selected>Select year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </div>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 pb-12 mt-2">
            <Button 
              type="submit" 
              className="w-full font-bold py-4 h-auto rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Complete Setup
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              className="w-full font-medium py-3 h-auto rounded-xl"
              onClick={() => router.push('/dashboard')}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </div>

      {/* Subtle Gradient background decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

    </div>
  );
}