'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddNewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  
  const [selectedTags, setSelectedTags] = useState<string[]>(['React']);
  const availableTags = ['React', 'Next.js', 'Solidity', 'Rust', 'Tailwind', 'Python', 'Go', 'Flutter'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Add New Project" 
        showBack={true} 
        onBack={() => router.back()}
        className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Progress Indicator */}
      <div className="bg-white dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
        <div className="h-1.5 flex-1 rounded-full bg-blue-600"></div>
        <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-4 pb-24 space-y-6">
        
        {/* Cover Image Upload (Simulated) */}
        <div className="w-full h-32 rounded-2xl relative overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
          <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-blue-500 transition-colors mb-2 z-10">cloud_upload</span>
          <span className="font-semibold text-sm text-slate-600 dark:text-slate-400 z-10">Upload Cover Image</span>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Project Title</label>
            <Input 
              placeholder="e.g. Decentralized Voting App" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Description</label>
            <textarea
              rows={4}
              placeholder="Briefly describe the project, your role, and the outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div>
          <div className="flex items-center justify-between mb-2 ml-1">
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tech Stack</label>
             <span className="text-xs text-blue-600 font-medium cursor-pointer">+ Add Custom</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800' 
                      : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">GitHub Repo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">code</span>
              <input 
                type="url"
                placeholder="https://github.com/..." 
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Live Demo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">language</span>
              <input 
                type="url"
                placeholder="https://..." 
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Actions Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-safe">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
          <Button className="flex-1">Next Step</Button>
        </div>
      </div>

    </div>
  );
}