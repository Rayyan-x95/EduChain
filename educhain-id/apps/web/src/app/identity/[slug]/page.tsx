'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePublicIdentity } from '@/hooks/api';
import { Loader2, BadgeCheck, Users, Award, ExternalLink } from 'lucide-react';
import { EduChainLogo } from '@/components/atoms/EduChainLogo';

export default function PublicIdentityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: identity, isLoading, error } = usePublicIdentity(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  if (error || !identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <h1 className="text-h2 text-[var(--text-primary)]">Identity Not Found</h1>
          <p className="text-body text-[var(--text-secondary)] mt-2">
            This identity profile does not exist or is not public.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Branding */}
        <div className="flex items-center gap-2 justify-center mb-2">
          <EduChainLogo size={28} />
          <span className="text-body-medium text-[var(--text-secondary)]">EduChain ID</span>
        </div>

        {/* Header */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-h2 text-[var(--text-primary)]">{identity.fullName}</h1>
              <p className="text-body text-[var(--text-secondary)]">@{identity.username}</p>
            </div>
            <BadgeCheck className="h-6 w-6 text-[var(--color-success)]" />
          </div>
          {identity.bio && (
            <p className="text-body text-[var(--text-secondary)] mt-3">{identity.bio}</p>
          )}
          <div className="flex gap-4 mt-4 text-caption text-[var(--text-tertiary)]">
            {identity.institution && <span>{identity.institution}</span>}
            {identity.degree && <span>{identity.degree}</span>}
            {identity.graduationYear && <span>Class of {identity.graduationYear}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
            <Award className="h-5 w-5 text-[var(--color-accent)] mx-auto mb-1" />
            <div className="text-h3 text-[var(--text-primary)]">{identity.verifiedCredentialCount}</div>
            <div className="text-caption text-[var(--text-tertiary)]">Verified Credentials</div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
            <BadgeCheck className="h-5 w-5 text-[var(--color-accent)] mx-auto mb-1" />
            <div className="text-h3 text-[var(--text-primary)]">{identity.endorsementCount}</div>
            <div className="text-caption text-[var(--text-tertiary)]">Endorsements</div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
            <Users className="h-5 w-5 text-[var(--color-accent)] mx-auto mb-1" />
            <div className="text-h3 text-[var(--text-primary)]">{identity.relationshipCount}</div>
            <div className="text-caption text-[var(--text-tertiary)]">Connections</div>
          </div>
        </div>

        {/* Skills */}
        {identity.skills?.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-body-medium text-[var(--text-primary)] mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {identity.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-caption px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* QR Verify Link */}
        <div className="text-center">
          <a
            href={`/verify/${identity.userId}`}
            className="inline-flex items-center gap-1 text-caption text-[var(--color-accent)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Verify this identity
          </a>
        </div>
      </div>
    </div>
  );
}
