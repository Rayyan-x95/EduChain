'use client';

import React from 'react';
import { SettingsPanel } from '@/components/organisms/SettingsPanel';
import { Button } from '@/components/atoms/Button';
import { AlertTriangle } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    title: 'Appearance',
    items: [
      { key: 'dark-mode', type: 'toggle' as const, label: 'Dark Mode', description: 'Use dark theme by default', defaultValue: true },
      { key: 'language', type: 'select' as const, label: 'Language', description: 'Preferred display language', options: ['English', 'Japanese', 'Spanish', 'French'], defaultValue: 'English' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { key: 'email-notifications', type: 'toggle' as const, label: 'Email Notifications', description: 'Get notified via email', defaultValue: true },
      { key: 'collab-notifications', type: 'toggle' as const, label: 'Collaboration Requests', description: 'Notify when someone sends a collaboration request', defaultValue: true },
      { key: 'profile-view-notifications', type: 'toggle' as const, label: 'Profile Views', description: 'Notify when a recruiter views your profile', defaultValue: false },
      { key: 'credential-notifications', type: 'toggle' as const, label: 'Credential Updates', description: 'Notify on credential verification and expiry', defaultValue: true },
    ],
  },
  {
    title: 'Privacy',
    items: [
      { key: 'profile-visibility', type: 'select' as const, label: 'Profile Visibility', description: 'Who can see your profile', options: ['Public', 'Verified Users', 'Connections Only'], defaultValue: 'Verified Users' },
      { key: 'show-email', type: 'toggle' as const, label: 'Show Email', description: 'Display email on your profile', defaultValue: false },
      { key: 'show-institution', type: 'toggle' as const, label: 'Show Institution', description: 'Display institution on search results', defaultValue: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'change-password', type: 'action' as const, label: 'Change Password', description: 'Update your account password' },
      { key: 'export-data', type: 'action' as const, label: 'Export Data', description: 'Download all your data as JSON' },
    ],
  },
];

export default function StudentSettingsPage() {
  const handleSettingChange = (key: string, value: unknown) => {
    // In production, persist to API
    console.log('Setting changed:', key, value);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">Settings</h1>
        <p className="text-body text-[var(--text-secondary)]">Manage your account preferences</p>
      </div>

      <SettingsPanel sections={SETTINGS_SECTIONS} onChange={handleSettingChange} />

      {/* Danger zone */}
      <div className="border border-[var(--color-danger)] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-body-medium text-[var(--color-danger)]">Danger Zone</h3>
            <p className="text-caption text-[var(--text-secondary)] mt-1">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Button variant="danger" size="sm" className="mt-3">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
