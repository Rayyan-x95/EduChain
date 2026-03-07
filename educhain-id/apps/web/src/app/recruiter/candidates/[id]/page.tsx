'use client';

import React from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { CredentialCard } from '@/components/molecules/CredentialCard';
import { AchievementCard } from '@/components/molecules/AchievementCard';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { ArrowLeft, Bookmark, BookmarkCheck, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useStudentById, useAddToShortlist, useRemoveFromShortlist, useShortlist } from '@/hooks/api';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const { data: candidate, isLoading } = useStudentById(params.id);
  const { data: shortlist } = useShortlist();
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();

  const shortlistedIds = new Set((shortlist ?? []).map((s: any) => s.studentId ?? s.id));
  const isShortlisted = shortlistedIds.has(params.id);

  const toggleShortlist = () => {
    if (isShortlisted) {
      removeFromShortlist.mutate(params.id);
    } else {
      addToShortlist.mutate({ studentId: params.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-body text-[var(--text-secondary)]">Candidate not found.</p>
        <Link href="/recruiter/discover">
          <Button variant="ghost" size="sm" className="mt-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Discover</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/recruiter/discover">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Discover
        </Button>
      </Link>

      {/* Profile header */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Avatar src={candidate.avatar ?? null} alt={candidate.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-h2 text-[var(--text-primary)]">{candidate.name}</h1>
              {candidate.institutionVerified && (
                <Badge variant="verified"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
              )}
            </div>
            <p className="text-body text-[var(--text-secondary)]">{candidate.degree ?? ''} &middot; {candidate.institution ?? ''}</p>
            <p className="text-caption text-[var(--text-tertiary)]">Class of {candidate.graduationYear ?? ''}</p>
            {candidate.bio && (
              <p className="text-body text-[var(--text-secondary)] mt-3">{candidate.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            variant={isShortlisted ? 'primary' : 'outline'}
            size="md"
            onClick={toggleShortlist}
          >
            {isShortlisted ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
          <Button variant="outline" size="md">
            <Mail className="h-4 w-4 mr-2" /> Contact
          </Button>
        </div>
      </div>

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <section>
          <h2 className="text-h4 text-[var(--text-primary)] mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s: any) => (
              <Chip key={typeof s === 'string' ? s : s.name}>{typeof s === 'string' ? s : s.name}</Chip>
            ))}
          </div>
        </section>
      )}

      {/* Credentials */}
      {candidate.credentials && candidate.credentials.length > 0 && (
        <section>
          <h2 className="text-h4 text-[var(--text-primary)] mb-3">Verified Credentials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidate.credentials.map((cred: any) => (
              <CredentialCard key={cred.id} {...cred} />
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {candidate.achievements && candidate.achievements.length > 0 && (
        <section>
          <h2 className="text-h4 text-[var(--text-primary)] mb-3">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidate.achievements.map((a: any) => (
              <AchievementCard key={a.id} title={a.title} issuer={a.issuer ?? ''} date={a.date ?? ''} />
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {candidate.projects && candidate.projects.length > 0 && (
        <section>
          <h2 className="text-h4 text-[var(--text-primary)] mb-3">Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidate.projects.map((p: any) => (
              <ProjectCard key={p.id} title={p.title} description={p.description ?? ''} status={p.status} techStack={p.techStack ?? []} memberCount={p.memberCount ?? 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
