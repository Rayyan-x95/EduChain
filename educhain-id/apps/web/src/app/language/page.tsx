'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSelectionPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { id: 'en', flag: '🇺🇸', name: 'English' },
    { id: 'es', flag: '🇪🇸', name: 'Spanish' },
    { id: 'fr', flag: '🇫🇷', name: 'French' },
    { id: 'de', flag: '🇩🇪', name: 'German' },
    { id: 'zh', flag: '🇨🇳', name: 'Chinese (Mandarin)' },
    { id: 'ja', flag: '🇯🇵', name: 'Japanese' },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display text-slate-900 dark:text-slate-100">
      
      {/* Header Section */}
      <div className="flex items-center p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800">
        <div 
          onClick={() => router.back()} 
          className="flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
          Language Selection
        </h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-6">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm bg-slate-100 dark:bg-slate-800">
            <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4 rounded-l-xl">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input 
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl bg-transparent focus:outline-0 focus:ring-2 focus:ring-primary border-none h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 pl-2 text-base font-normal leading-normal" 
              placeholder="Search languages" 
              type="text"
            />
          </div>
        </label>
      </div>

      {/* Language List */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 px-1">
          Common Languages
        </p>

        {languages.map((lang) => (
          <label 
            key={lang.id}
            className={`flex items-center gap-4 rounded-xl border border-solid p-4 flex-row-reverse cursor-pointer transition-colors group ${selectedLanguage === lang.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/50'}`}
          >
            <div className="relative flex items-center justify-center h-5 w-5">
              <input 
                checked={selectedLanguage === lang.id}
                onChange={() => setSelectedLanguage(lang.id)}
                className="peer absolute h-5 w-5 opacity-0 cursor-pointer" 
                name="language" 
                type="radio"
              />
              <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                 {selectedLanguage === lang.id && <div className="h-2 w-2 rounded-full bg-white"></div>}
              </div>
            </div>
            <div className="flex grow items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <p className="text-sm font-medium leading-normal">{lang.name}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Sticky Bottom Button */}
      <div className="sticky bottom-0 bg-background-light dark:bg-background-dark p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => router.back()}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-[98%]"
        >
          <span className="truncate">Save Changes</span>
        </button>
      </div>

      {/* Decorative spacer for mobile viewports */}
      <div className="h-6"></div>
    </div>
  );
}
