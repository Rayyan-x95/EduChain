'use client';

import React from 'react';
import { VirtualStudentID } from '@/components/organisms/VirtualStudentID';
import { ActivityFeed } from '@/components/organisms/ActivityFeed';
import { CredentialCard } from '@/components/molecules/CredentialCard';
import { CollaborationRequestCard } from '@/components/molecules/CollaborationRequestCard';
import { StudentCard } from '@/components/molecules/StudentCard';
import { StatCard } from '@/components/organisms/Shared';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { ArrowRight, Award, FileCheck, Users, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import {
  useMyCredentials,
  useCollaborationRequests,
  useStudentProfile,
  useStudentStats,
  useActivityFeed,
  useSearchStudents,
  useProfileCompletion,
} from '@/hooks/api';

export default function StudentHomePage() {
  const { user } = useAuth();
  const { data: profile } = useStudentProfile();
  const { data: stats } = useStudentStats();
  const { data: credentials, isLoading: credLoading } = useMyCredentials();
  const { data: collabRequests } = useCollaborationRequests('incoming');
  const { data: suggestedResult } = useSearchStudents({ q: '' });
  const { data: activities } = useActivityFeed();
  const { data: completion } = useProfileCompletion();

  const recentCredentials = credentials?.slice(0, 2) ?? [];
  const recentRequests = collabRequests?.slice(0, 2) ?? [];
  const suggestedStudents = suggestedResult?.results?.slice(0, 2) ?? [];
  const displayName = profile?.name ?? user?.user_metadata?.full_name ?? 'Student';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome + Stats */}
      <div>
        <h1 className="text-h2 text-[var(--text-primary)] mb-1">Welcome back, {displayName.split(' ')[0]}</h1>
        <p className="text-body text-[var(--text-secondary)]">Here&apos;s your academic identity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Credentials" value={stats?.credentialCount ?? 0} />
        <StatCard label="Verifications" value={stats?.verificationCount ?? 0} />
        <StatCard label="Collaborations" value={stats?.collaborationCount ?? 0} />
        <StatCard label="Profile Views" value={stats?.profileViews ?? 0} />
      </div>

      {/* Profile Completion */}
      {completion && completion.score < 100 && (
        <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-subtitle font-medium text-[var(--text-primary)]">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Profile Completion
            </h3>
            <span className="text-sm font-semibold text-[var(--accent-primary)]">{completion.score}%</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
              style={{ width: `${completion.score}%` }}
            />
          </div>
          {completion.missing?.length > 0 && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Add your {completion.missing.slice(0, 3).join(', ')} to improve your profile.
            </p>
          )}
        </div>
      )}

      {/* Virtual ID Card */}
      {profile && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h4 text-[var(--text-primary)]">Your Student ID</h2>
            <Link href="/student/profile">
              <Button variant="ghost" size="sm">View Profile <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
          <VirtualStudentID
            name={profile.name}
            institution={profile.institution ?? ''}
            degree={profile.degree ?? ''}
            graduationYear={profile.graduationYear ?? ''}
            studentId={profile.studentId ?? ''}
            fieldsOfInterest={profile.fieldsOfInterest ?? []}
            institutionVerified={profile.institutionVerified ?? false}
            credentialVerified={profile.credentialVerified ?? false}
          />
        </section>
      )}

      {/* Recent Credentials */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-h4 text-[var(--text-primary)]">Recent Credentials</h2>
          <Link href="/student/credentials">
            <Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
        {credLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentCredentials.map((cred: any) => (
              <CredentialCard key={cred.id} {...cred} />
            ))}
          </div>
        )}
      </section>

      {/* Collaboration Requests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-h4 text-[var(--text-primary)]">
            Collaboration Requests
            {recentRequests.length > 0 && <Badge variant="info" className="ml-2">{recentRequests.length}</Badge>}
          </h2>
          <Link href="/student/collaborations">
            <Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentRequests.map((req: any) => (
            <CollaborationRequestCard
              key={req.id}
              name={req.senderName ?? ''}
              institution={req.senderInstitution ?? ''}
              message={req.message ?? ''}
              verified={true}
            />
          ))}
        </div>
      </section>

      {/* Suggested Students */}
      {suggestedStudents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h4 text-[var(--text-primary)]">Suggested Collaborators</h2>
            <Link href="/student/search">
              <Button variant="ghost" size="sm">Discover <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedStudents.map((s: any) => (
              <StudentCard
                key={s.id}
                name={s.name}
                institution={s.institution}
                skills={s.skills ?? []}
                verified={s.verified ?? false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Activity Feed */}
      <ActivityFeed activities={activities ?? []} />
    </div>
  );
}
