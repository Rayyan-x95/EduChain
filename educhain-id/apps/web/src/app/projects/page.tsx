'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  link?: string;
  github?: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Decentralized Identity App',
    description: 'A mobile application built with Flutter and Rust that allows users to manage their decentralized identifiers (DIDs) and verified credentials securely on their devices.',
    tags: ['Flutter', 'Rust', 'Blockchain', 'DID'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    link: 'https://demo.educhain.com/did',
    github: 'https://github.com/educhain/did-app'
  },
  {
    id: '2',
    title: 'Smart Contract Auditor',
    description: 'An automated tool for analyzing Solidity smart contracts and identifying common vulnerabilities. Integrated with popular CI/CD pipelines.',
    tags: ['Solidity', 'Python', 'Web3', 'Security'],
    github: 'https://github.com/educhain/auditor'
  },
  {
    id: '3',
    title: 'Zero Knowledge Voting',
    description: 'A privacy-preserving voting system built on Ethereum using zk-SNARKs. Ensures verifiability without compromising voter anonymity.',
    tags: ['Ethereum', 'zk-SNARKs', 'React'],
    link: 'https://zkvote.educhain.com',
  }
];

export default function ProjectsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Web3', 'Mobile', 'Security'];

  // Temporary naive filter logic
  const filteredProjects = mockProjects.filter(p => {
    if (activeFilter === 'All') return true;
    return p.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase() || 
                              (activeFilter === 'Web3' && ['Blockchain', 'Ethereum', 'Solidity'].includes(tag)));
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Portfolio & Projects" 
        showBack={true} 
        onBack={() => router.back()}
        rightAction={
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">add</span>
          </Button>
        }
        className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Filter Chips */}
      <div className="flex px-4 py-3 gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              activeFilter === filter
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto w-full p-4 pb-24 space-y-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            
            {/* Project Image Placeholder */}
            {project.imageUrl && (
              <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 relative">
                 {/*  Ideally replace with Next Image when domains are configured
                 <Image src={project.imageUrl} alt={project.title} fill className="object-cover" /> */}
                 <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500/50 text-4xl">code</span>
                 </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                {project.title}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                {project.link && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-1 h-8 rounded-lg border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View Live
                  </Button>
                )}
                {project.github && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-1 h-8 rounded-lg border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[16px]">code</span>
                    Source
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">folder_off</span>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No projects found for this filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}