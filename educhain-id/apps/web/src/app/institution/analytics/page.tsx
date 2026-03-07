'use client';

import React from 'react';
import { StatCard } from '@/components/organisms/Shared';

const STATS = [
  { label: 'Total Credentials Issued', value: '1,532', trend: '+8% this month' },
  { label: 'Verified Students', value: '2,847' },
  { label: 'Avg. Verification Time', value: '2.3h' },
  { label: 'Recruiter Views', value: '456', trend: '+23% this month' },
];

export default function InstitutionAnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">Analytics</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">Institution performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} trend={stat.trend} />
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <h3 className="text-h4 text-[var(--text-primary)] mb-4">Credentials Over Time</h3>
          <div className="flex items-center justify-center h-[240px] text-[var(--text-tertiary)]">
            Chart placeholder — integrate with your preferred charting library
          </div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
          <h3 className="text-h4 text-[var(--text-primary)] mb-4">Verification Distribution</h3>
          <div className="flex items-center justify-center h-[240px] text-[var(--text-tertiary)]">
            Chart placeholder — integrate with your preferred charting library
          </div>
        </div>
      </div>
    </div>
  );
}
