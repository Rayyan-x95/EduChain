'use client';

import React from 'react';
import { VirtualStudentID } from '@/components/organisms/VirtualStudentID';
import { StudentProfileHeader } from '@/components/organisms/StudentProfileHeader';
import { CredentialList } from '@/components/organisms/CredentialList';
import { ActivityFeed } from '@/components/organisms/ActivityFeed';
import { Chip } from '@/components/atoms/Chip';
import { AchievementCard } from '@/components/molecules/AchievementCard';
import { Loader2 } from 'lucide-react';
import {
  useStudentProfile,
  useMyCredentials,
  useMyAchievements,
  useMySkills,
  useActivityFeed,
} from '@/hooks/api';

export default function StudentProfilePage() {
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: credentials } = useMyCredentials();
  const { data: achievements } = useMyAchievements();
  const { data: skills } = useMySkills();
  const { data: activities } = useActivityFeed();

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Virtual Student ID */}
      {profile && (
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
      )}

      {/* Profile Header */}
      {profile && (
        <StudentProfileHeader
          name={profile.name}
          institution={profile.institution ?? ''}
          degree={profile.degree ?? ''}
          graduationYear={profile.graduationYear ?? ''}
          verified={profile.institutionVerified ?? false}
          isOwnProfile={true}
        />
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section>
          <h3 className="text-h4 text-[var(--text-primary)] mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any) => (
              <Chip key={skill.id}>{skill.name}</Chip>
            ))}
          </div>
        </section>
      )}

      {/* Credentials */}
      <CredentialList credentials={credentials ?? []} />

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <section>
          <h3 className="text-h4 text-[var(--text-primary)] mb-3">Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((a: any) => (
              <AchievementCard key={a.id} title={a.title} issuer={a.issuer ?? ''} date={a.date ?? ''} />
            ))}
          </div>
        </section>
      )}

      {/* Activity */}
      <ActivityFeed activities={activities ?? []} />
    </div>
  );
}
