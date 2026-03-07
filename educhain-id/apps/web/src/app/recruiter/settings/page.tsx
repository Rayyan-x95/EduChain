'use client';

import React from 'react';
import { SettingsPanel } from '@/components/organisms/SettingsPanel';
import { Button } from '@/components/atoms/Button';
import { AlertTriangle } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    title: 'Company Profile',
    items: [
      { key: 'company-name', type: 'action' as const, label: 'Company Name', description: 'TechCorp Inc.' },
      { key: 'company-logo', type: 'action' as const, label: 'Company Logo', description: 'Upload or change your company logo' },
      { key: 'company-website', type: 'action' as const, label: 'Website', description: 'https://techcorp.example.com' },
    ],
  },
  {
    title: 'Search Preferences',
    items: [
      { key: 'preferred-institutions', type: 'action' as const, label: 'Preferred Institutions', description: 'Manage your list of preferred institutions' },
      { key: 'min-verification', type: 'toggle' as const, label: 'Verified Only', description: 'Only show students with verified credentials', defaultValue: true },
      { key: 'results-per-page', type: 'select' as const, label: 'Results Per Page', description: 'Number of candidates per page', options: ['10', '25', '50'], defaultValue: '25' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { key: 'new-candidate-alerts', type: 'toggle' as const, label: 'New Candidate Alerts', description: 'Get notified when new matching candidates register', defaultValue: true },
      { key: 'shortlist-updates', type: 'toggle' as const, label: 'Shortlist Updates', description: 'Notify when shortlisted candidates update profiles', defaultValue: true },
      { key: 'weekly-report', type: 'toggle' as const, label: 'Weekly Report', description: 'Receive a weekly summary of talent insights', defaultValue: false },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'change-password', type: 'action' as const, label: 'Change Password', description: 'Update your account password' },
      { key: 'team-members', type: 'action' as const, label: 'Team Members', description: 'Manage team access to the recruiter portal' },
    ],
  },
];

export default function RecruiterSettingsPage() {
  const handleChange = (key: string, value: unknown) => {
    console.log('Setting changed:', key, value);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">Recruiter Settings</h1>
        <p className="text-body text-[var(--text-secondary)]">Configure your recruiter portal</p>
      </div>

      <SettingsPanel sections={SETTINGS_SECTIONS} onChange={handleChange} />

      <div className="border border-[var(--color-danger)] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-body-medium text-[var(--color-danger)]">Danger Zone</h3>
            <p className="text-caption text-[var(--text-secondary)] mt-1">
              Deactivate your recruiter account. This will remove access to all candidate data.
            </p>
            <Button variant="danger" size="sm" className="mt-3">Deactivate Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
