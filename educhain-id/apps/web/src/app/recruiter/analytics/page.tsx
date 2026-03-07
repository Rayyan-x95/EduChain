'use client';

import React from 'react';
import { StatCard } from '@/components/organisms/Shared';

const STATS = [
  { label: 'Students Viewed', value: '342', trend: '+15% this month' },
  { label: 'Shortlisted', value: '28' },
  { label: 'Profiles Requested', value: '12' },
  { label: 'Avg. Response Time', value: '4.2h' },
];

export default function RecruiterAnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">Analytics</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">Your recruiting activity insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} trend={stat.trend} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <h3 className="text-h4 text-[var(--text-primary)] mb-4">Search Activity</h3>
          <div className="flex items-center justify-center h-[240px] text-[var(--text-tertiary)]">
            Chart placeholder
          </div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <h3 className="text-h4 text-[var(--text-primary)] mb-4">Top Skills Searched</h3>
          <div className="flex items-center justify-center h-[240px] text-[var(--text-tertiary)]">
            Chart placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
