'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { useAuth } from '@/providers/AuthProvider';

interface SettingSectionProps {
  title: string;
  items: {
    icon: string;
    label: string;
    type?: 'link' | 'toggle' | 'danger';
    value?: boolean;
    href?: string;
  }[];
}

const settingsSections: SettingSectionProps[] = [
  {
    title: 'Account Settings',
    items: [
      { icon: 'account_circle', label: 'Personal Information', type: 'link', href: '/profile' },
      { icon: 'lock', label: 'Password & Security', type: 'link', href: '/auth/forgot-password' },
      { icon: 'wallet', label: 'Identity Wallet', type: 'link', href: '/wallet' },
      { icon: 'notifications', label: 'Notification Center', type: 'link', href: '/notifications' },
    ]
  },
  {
    title: 'App Preferences',
    items: [
      { icon: 'language', label: 'Language', type: 'link', href: '/language' },
      { icon: 'dark_mode', label: 'Dark Mode', type: 'toggle', value: true },
      { icon: 'security', label: 'Privacy Control', type: 'link', href: '/settings/privacy' },
    ]
  },
  {
    title: 'Support & Information',
    items: [
      { icon: 'help', label: 'Help Center', type: 'link', href: 'https://help.educhain.com' },
      { icon: 'info', label: 'About EduChain', type: 'link', href: 'https://educhain.com/about' },
      { icon: 'policy', label: 'Terms of Service', type: 'link', href: 'https://educhain.com/terms' },
      { icon: 'description', label: 'Privacy Policy', type: 'link', href: 'https://educhain.com/privacy' },
    ]
  },
  {
    title: 'Danger Zone',
    items: [
      { icon: 'logout', label: 'Log Out', type: 'danger' },
      { icon: 'delete_forever', label: 'Delete Account', type: 'danger' },
    ]
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleToggle = (label: string) => {
    if (label === 'Dark Mode') {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  };

  const handleDangerAction = (label: string) => {
    if (label === 'Log Out') {
      void signOut().then(() => {
        router.replace('/auth/login');
      });
    } else if (label === 'Delete Account') {
      router.push('/settings/privacy');
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans mx-auto max-w-md w-full relative">
      
      {/* Top Header */}
      <TopAppBar 
        title="Settings" 
        showBack={true} 
        onBack={() => router.back()}
        className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800"
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto w-full pb-20">
        <div className="p-4 space-y-6">
          
          {settingsSections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                {section.title}
              </h3>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 shadow-sm">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="w-full">
                    {item.type === 'link' && item.href ? (
                      <Link href={item.href} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors">
                            {item.icon}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {item.label}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400">
                          chevron_right
                        </span>
                      </Link>
                    ) : item.type === 'toggle' ? (
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">
                            {item.icon}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {item.label}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            defaultChecked={item.value} 
                            onChange={() => handleToggle(item.label)}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ) : item.type === 'danger' ? (
                      <button 
                        onClick={() => handleDangerAction(item.label)}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-red-500">
                            {item.icon}
                          </span>
                          <span className="text-red-500 font-medium">
                            {item.label}
                          </span>
                        </div>
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
