'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { SearchFilterPanel, type FilterState } from '@/components/organisms/SearchFilterPanel';
import { ErrorState } from '@/components/organisms/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAddToShortlist, useInstitutionAutocomplete, useTalentSearch } from '@/hooks/api';
import { useAuth } from '@/providers/AuthProvider';

type TalentCandidate = {
  studentId: string;
  fullName: string;
  institution?: string | null;
  degree?: string | null;
  graduationYear?: number | null;
  topSkills?: string[];
  verifiedCredentialCount?: number;
  endorsementCount?: number;
  talentScore?: number;
};

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'Recruiter';
  return (email.split('@')[0] ?? 'Recruiter')
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function RecruiterDiscoveryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    institution: '',
    year: '',
    verifiedOnly: false,
  });
  const institutionQuery = useInstitutionAutocomplete();
  const searchQuery = useTalentSearch({
    skills: filters.skills.join(',') || undefined,
    institution: filters.institution || undefined,
    graduation_year: filters.year ? Number(filters.year) : undefined,
    page: 1,
  });
  const shortlistMutation = useAddToShortlist();

  const layoutUser = {
    name: displayNameFromEmail(user?.email),
    email: user?.email ?? 'recruiter@educhain.local',
    avatar: null,
  };

  const institutionOptions = useMemo(() => {
    const apiInstitutions = Array.isArray(institutionQuery.data)
      ? institutionQuery.data
          .map((institution) => (institution as { name?: string | null }).name)
          .filter((name): name is string => Boolean(name))
      : [];
    return Array.from(new Set(apiInstitutions)).slice(0, 12);
  }, [institutionQuery.data]);

  const candidates = (((searchQuery.data as { results?: TalentCandidate[] } | undefined)?.results) ?? []).filter(
    (candidate) =>
      (search.trim().length === 0 ||
        candidate.fullName.toLowerCase().includes(search.trim().toLowerCase()) ||
        candidate.topSkills?.some((skill) => skill.toLowerCase().includes(search.trim().toLowerCase()))) &&
      (!filters.verifiedOnly || (candidate.verifiedCredentialCount ?? 0) > 0),
  ) as TalentCandidate[];

  return (
    <DashboardLayout role="recruiter" user={layoutUser}>
      <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Talent Discovery
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Find students with verifiable signal
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Every candidate shown here is ranked from credentials, portfolio depth, endorsements, and
          network relationships instead of self-reported claims alone.
        </p>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]">
        <SearchFilterPanel
          availableSkills={[
            'React',
            'TypeScript',
            'Node.js',
            'Python',
            'Solidity',
            'Design',
            'Research',
          ]}
          availableInstitutions={institutionOptions}
          availableYears={['2025', '2026', '2027', '2028']}
          onSearch={(value) => setSearch(value)}
          onFilter={(value) => setFilters(value)}
          onClear={() => {
            setSearch('');
            setFilters({ skills: [], institution: '', year: '', verifiedOnly: false });
          }}
          className="xl:sticky xl:top-24"
        />

        <div className="space-y-4">
          {searchQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
              />
            ))
          ) : searchQuery.isError ? (
            <ErrorState
              title="Discovery results unavailable"
              message="We couldn't load recruiter-ranked student results."
              onRetry={() => void searchQuery.refetch()}
            />
          ) : candidates.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
              No candidates match the current filters.
            </div>
          ) : (
            candidates.map((candidate) => (
              <article
                key={candidate.studentId}
                className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                        Talent Score {candidate.talentScore ?? 0}
                      </span>
                      <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                        {candidate.verifiedCredentialCount ?? 0} verified credentials
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                      {candidate.fullName}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {candidate.institution ?? 'Institution not listed'}
                      {candidate.degree ? ` · ${candidate.degree}` : ''}
                      {candidate.graduationYear ? ` · ${candidate.graduationYear}` : ''}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(candidate.topSkills ?? []).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => shortlistMutation.mutate({ studentId: candidate.studentId })}
                      disabled={shortlistMutation.isPending}
                    >
                      Save to Shortlist
                    </Button>
                    <Link href={`/recruiter/contact/${candidate.studentId}`}>
                      <Button variant="outline">Open Candidate</Button>
                    </Link>
                    <Link href={`/verify/${candidate.studentId}`}>
                      <Button variant="outline">Verify Identity</Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
