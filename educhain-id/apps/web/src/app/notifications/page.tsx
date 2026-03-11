'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'unread' | 'archived';

interface NotificationProps {
  id: string;
  isUnread: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  message: string;
  time: string;
}

const mockNotifications: Record<string, NotificationProps[]> = {
  Today: [
    {
      id: '1',
      isUnread: true,
      icon: 'workspace_premium',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      title: 'New Credential Issued',
      message: 'Your Google "Advanced Blockchain Architecture" certificate is now verified and available in your wallet.',
      time: '2m'
    },
    {
      id: '2',
      isUnread: true,
      icon: 'sync_alt',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
      title: 'ID Sync Complete',
      message: 'Your Stanford identity profile has been successfully anchored to the mainnet.',
      time: '1h'
    }
  ],
  Yesterday: [
    {
      id: '3',
      isUnread: false,
      icon: 'campaign',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600',
      title: 'Platform Update',
      message: 'EduChain ID v2.4 is live. Check out the new privacy preserving sharing features in your settings.',
      time: '1d'
    }
  ]
};

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Notifications" 
        showBack={true} 
        onBack={() => router.back()}
        rightAction={
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">more_vert</span>
          </Button>
        }
        className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Tabs */}
      <div className="flex px-4 gap-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {(['all', 'unread', 'archived'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "py-3 text-sm font-bold capitalize tracking-wide transition-all border-b-[3px]",
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto w-full pb-20">
        {Object.entries(mockNotifications).map(([date, items]) => (
          <div key={date}>
            <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-900 sticky top-0 z-10 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{date}</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex gap-4 items-start cursor-pointer group">
                  <div className="relative shrink-0">
                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", item.iconBg)}>
                      <span className={cn("material-symbols-outlined", item.iconColor)}>{item.icon}</span>
                    </div>
                    {item.isUnread && (
                      <span className="absolute top-0 right-0 h-3 w-3 bg-blue-600 rounded-full border-2 border-white dark:border-slate-950"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className={cn("text-sm leading-snug truncate", item.isUnread ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-700 dark:text-slate-300")}>
                        {item.title}
                      </h4>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-2">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 pr-2">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/wallet" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">badge</span>
            <span className="text-[10px] font-semibold">Identity</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center gap-1 text-blue-600 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="text-[10px] font-semibold">Alerts</span>
            <span className="absolute top-0 right-1 border border-white dark:border-slate-950 w-2 h-2 rounded-full bg-blue-600"></span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-semibold">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}