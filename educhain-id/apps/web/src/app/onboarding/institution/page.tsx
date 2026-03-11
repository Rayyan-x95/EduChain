'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';

interface Institution {
  id: string;
  name: string;
  location: string;
  logo: string;
}

const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'Stanford University',
    location: 'Palo Alto, California',
    logo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Harvard University',
    location: 'Cambridge, Massachusetts',
    logo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Massachusetts Institute of Technology',
    location: 'Cambridge, Massachusetts',
    logo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
  },
];

export default function SelectInstitutionPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = mockInstitutions.filter(inst => 
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <TopAppBar 
        showBack={true} 
        onBack={() => router.back()} 
        title="Onboarding" 
      />
      
      {/* Progress Section */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-6 justify-between">
          <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-normal">
            Step 2: Institution Selection
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
            2 of 5
          </p>
        </div>
        <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-2 overflow-hidden flex w-full">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: '40%' }}></div>
        </div>
      </div>
      
      {/* Instructions */}
      <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
        Select your primary institution to begin verification
      </h3>
      
      {/* Search Bar */}
      <div className="px-4 py-4">
        <Input 
          icon={<span className="material-symbols-outlined">search</span>}
          placeholder="Search for your university"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border-none shadow-sm h-12"
        />
      </div>
      
      {/* List Section */}
      <div className="px-4 py-2 flex-1">
        <h3 className="text-slate-900 dark:text-slate-100 text-sm font-semibold uppercase tracking-wider mb-4">
          Verified Institutions
        </h3>
        <div className="flex flex-col gap-3 pb-8">
          {filtered.map(institution => (
            <div 
              key={institution.id}
              onClick={() => setSelectedId(institution.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border transition-colors cursor-pointer group",
                selectedId === institution.id 
                  ? "border-blue-600" 
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-600/50"
              )}
            >
              <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                <img className="w-10 h-10 object-cover rounded-full" alt={institution.name} src={institution.logo} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-slate-900 dark:text-slate-100 font-semibold text-base">{institution.name}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">{institution.location}</span>
              </div>
              <span className={cn(
                "material-symbols-outlined transition-opacity",
                selectedId === institution.id ? "text-blue-600 opacity-100" : "text-blue-600 opacity-0 group-hover:opacity-100"
              )}>
                check_circle
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Action */}
      <div className="mt-auto p-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md sticky bottom-0 border-t border-slate-200 dark:border-slate-800">
        <Button 
          fullWidth 
          size="lg" 
          disabled={!selectedId}
          className="font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 text-wrap gap-2 h-auto"
          onClick={() => router.push('/onboarding/profile')}
        >
          Continue to Verification
          <span className="material-symbols-outlined items-center flex">arrow_forward</span>
        </Button>
        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-4">
          Can't find your university? <a className="text-blue-600 hover:underline font-medium" href="#">Contact Support</a>
        </p>
      </div>
    </div>
  );
}