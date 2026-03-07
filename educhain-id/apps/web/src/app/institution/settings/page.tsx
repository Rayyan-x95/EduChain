'use client';

import React from 'react';
import { SettingsPanel } from '@/components/organisms/SettingsPanel';
import { StatCard } from '@/components/organisms/Shared';
import { Button } from '@/components/atoms/Button';
import { Building2, AlertTriangle } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    title: 'Institution Profile',
    items: [
      { key: 'inst-name', type: 'action' as const, label: 'Institution Name', description: 'Massachusetts Institute of Technology' },
      { key: 'inst-domain', type: 'action' as const, label: 'Email Domain', description: 'mit.edu' },
      { key: 'inst-logo', type: 'action' as const, label: 'Institution Logo', description: 'Upload or change your institution logo' },
    ],
  },
  {
    title: 'Verification Settings',
    items: [
      { key: 'auto-verify', type: 'toggle' as const, label: 'Auto-Verify Students', description: 'Automatically verify students with matching institution email domain', defaultValue: false },
      { key: 'require-id', type: 'toggle' as const, label: 'Require Student ID', description: 'Require student ID upload for verification', defaultValue: true },
      { key: 'credential-expiry', type: 'select' as const, label: 'Default Credential Expiry', description: 'Default expiration for issued credentials', options: ['Never', '1 Year', '2 Years', '5 Years'], defaultValue: 'Never' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { key: 'email-notifications', type: 'toggle' as const, label: 'Email Notifications', description: 'Receive email for new verification requests', defaultValue: true },
      { key: 'daily-digest', type: 'toggle' as const, label: 'Daily Digest', description: 'Receive a daily summary email', defaultValue: false },
    ],
  },
  {
    title: 'Security',
    items: [
      { key: 'two-factor', type: 'toggle' as const, label: 'Two-Factor Authentication', description: 'Require 2FA for admin actions', defaultValue: true },
      { key: 'api-keys', type: 'action' as const, label: 'API Keys', description: 'Manage integration API keys' },
    ],
  },
];

export default function InstitutionSettingsPage() {
  const handleChange = (key: string, value: unknown) => {
    console.log('Setting changed:', key, value);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">Institution Settings</h1>
        <p className="text-body text-[var(--text-secondary)]">Configure your institution portal</p>
      </div>

      <SettingsPanel sections={SETTINGS_SECTIONS} onChange={handleChange} />

      {/* Danger zone */}
      <div className="border border-[var(--color-danger)] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-body-medium text-[var(--color-danger)]">Danger Zone</h3>
            <p className="text-caption text-[var(--text-secondary)] mt-1">
              Revoke all issued credentials or deactivate the institution account.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="danger" size="sm">Revoke All Credentials</Button>
              <Button variant="ghost" size="sm">Deactivate Account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
