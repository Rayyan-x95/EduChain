'use client';

import React from 'react';
import { StatCard, DataTable } from '@/components/organisms/Shared';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { FileCheck, Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useInstitutionStats, useInstitutionCredentials } from '@/hooks/api';

export default function InstitutionDashboard() {
  const { data: stats, isLoading: statsLoading } = useInstitutionStats();
  const { data: credentials, isLoading: credLoading } = useInstitutionCredentials();

  const recentVerifications = (credentials ?? []).slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-body text-[var(--text-secondary)] mt-1">Overview of your institution&apos;s activity</p>
        </div>
        <Link href="/institution/credentials/issue">
          <Button variant="primary" size="md">Issue Credential</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          <div className="col-span-4 flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
        ) : (
          <>
            <StatCard label="Total Students" value={stats?.totalStudents ?? 0} />
            <StatCard label="Credentials Issued" value={stats?.credentialsIssued ?? 0} />
            <StatCard label="Pending Verifications" value={stats?.pendingVerifications ?? 0} />
            <StatCard label="Verified Today" value={stats?.verifiedToday ?? 0} />
          </>
        )}
      </div>

      {/* Recent Verifications */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-h4 text-[var(--text-primary)]">Recent Verifications</h2>
          <Link href="/institution/students">
            <Button variant="ghost" size="sm">View All &rarr;</Button>
          </Link>
        </div>
        {credLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
        ) : (
          <DataTable
            columns={[
              { key: 'studentName', header: 'Student' },
              { key: 'title', header: 'Credential' },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => <Badge variant={row.status as 'verified' | 'pending' | 'revoked'}>{row.status}</Badge>,
              },
              { key: 'issueDate', header: 'Date' },
            ]}
            data={recentVerifications}
          />
        )}
      </div>
    </div>
  );
}
