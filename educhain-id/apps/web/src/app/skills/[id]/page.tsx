'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/organisms/ErrorState';
import { useMyEndorsements, useMySkillProofs, useMySkills, useSubmitSkillProof } from '@/hooks/api';

type SkillRecord = { id: number; name: string };
type SkillProofRecord = {
  id: string;
  skillId: number;
  proofType: string;
  referenceUrl?: string | null;
  description?: string | null;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verificationScore?: number;
  createdAt?: string | Date;
};
type EndorsementRecord = {
  id: string;
  skillId: number;
  message?: string | null;
  createdAt?: string | Date;
  endorser?: { fullName?: string | null } | null;
};

const PROOF_TYPES = [
  'github_repository',
  'hackathon_certificate',
  'course_completion',
  'peer_endorsement',
  'project_contribution',
] as const;

function formatSkillName(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function formatProofLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function formatDate(value?: string | Date) {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}

export default function SkillDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const skillsQuery = useMySkills();
  const proofsQuery = useMySkillProofs();
  const endorsementsQuery = useMyEndorsements();
  const submitProof = useSubmitSkillProof();
  const [proofType, setProofType] =
    useState<(typeof PROOF_TYPES)[number]>('github_repository');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const skillId = Number(params.id);
  const skills = useMemo(
    () => (Array.isArray(skillsQuery.data) ? skillsQuery.data : []) as SkillRecord[],
    [skillsQuery.data],
  );
  const proofs = useMemo(
    () => (Array.isArray(proofsQuery.data) ? proofsQuery.data : []) as SkillProofRecord[],
    [proofsQuery.data],
  );
  const endorsements = useMemo(
    () =>
      (Array.isArray(endorsementsQuery.data)
        ? endorsementsQuery.data
        : []) as EndorsementRecord[],
    [endorsementsQuery.data],
  );

  const skill = useMemo(() => skills.find((entry) => entry.id === skillId), [skillId, skills]);
  const skillProofs = useMemo(
    () => proofs.filter((proof) => proof.skillId === skillId),
    [proofs, skillId],
  );
  const skillEndorsements = useMemo(
    () => endorsements.filter((endorsement) => endorsement.skillId === skillId),
    [endorsements, skillId],
  );

  async function handleSubmitProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!skill) return;

    setError(null);
    try {
      await submitProof.mutateAsync({
        skillName: skill.name,
        proofType,
        referenceUrl: referenceUrl.trim() || undefined,
        description: description.trim() || undefined,
      });
      setReferenceUrl('');
      setDescription('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit proof.');
    }
  }

  if (skillsQuery.isLoading || proofsQuery.isLoading || endorsementsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80" />
      </div>
    );
  }

  if (skillsQuery.isError || proofsQuery.isError || endorsementsQuery.isError) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Skill detail unavailable"
            message="We couldn't load this skill and its trust signals."
            onRetry={() => {
              void skillsQuery.refetch();
              void proofsQuery.refetch();
              void endorsementsQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Skill not found"
            message="This skill is not part of your profile yet."
          />
        </div>
      </div>
    );
  }

  const verifiedProofs = skillProofs.filter((proof) => proof.verificationStatus === 'verified').length;

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <TopAppBar
        title="Skill Detail"
        showBack
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {verifiedProofs > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Verified evidence
                  </span>
                )}
                <span className="rounded-full bg-[var(--bg-default)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  {skillEndorsements.length} endorsements
                </span>
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                {formatSkillName(skill.name)}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                Attach evidence here to move this skill from a simple claim to a trust-backed signal.
              </p>
            </div>

            <div className="grid min-w-[220px] gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  Proofs
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{skillProofs.length}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  Verified
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{verifiedProofs}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  Endorsements
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                  {skillEndorsements.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form
            className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
            onSubmit={handleSubmitProof}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Add Proof
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
              Back this skill with evidence
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                  Proof type
                </label>
                <select
                  value={proofType}
                  onChange={(event) => setProofType(event.target.value as (typeof PROOF_TYPES)[number])}
                  className="h-12 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 text-sm text-[var(--text-primary)]"
                >
                  {PROOF_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {formatSkillName(formatProofLabel(option))}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                  Reference URL
                </label>
                <Input
                  type="url"
                  value={referenceUrl}
                  onChange={(event) => setReferenceUrl(event.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                  Context
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain what this proof demonstrates and why it matters."
                  className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-3 text-sm text-[var(--text-primary)]"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={submitProof.isPending}>
                <Sparkles className="mr-2 h-4 w-4" />
                {submitProof.isPending ? 'Submitting...' : 'Submit Proof'}
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    Proof Timeline
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    Evidence attached to this skill
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {skillProofs.length > 0 ? (
                  skillProofs.map((proof) => (
                    <article
                      key={proof.id}
                      className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          {formatProofLabel(proof.proofType)}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                          {proof.verificationStatus ?? 'pending'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        Added {formatDate(proof.createdAt)}
                      </p>
                      {proof.description && (
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {proof.description}
                        </p>
                      )}
                      {proof.referenceUrl && (
                        <a
                          href={proof.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                        >
                          Open reference
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                      {typeof proof.verificationScore === 'number' && (
                        <p className="mt-3 text-xs text-[var(--text-tertiary)]">
                          Verification score: {proof.verificationScore}
                        </p>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                    No proof has been submitted for this skill yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Endorsements
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                Peer and mentor signals
              </h2>

              <div className="mt-6 space-y-4">
                {skillEndorsements.length > 0 ? (
                  skillEndorsements.map((endorsement) => (
                    <article
                      key={endorsement.id}
                      className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {endorsement.endorser?.fullName ?? 'Verified peer'}
                        </p>
                      </div>
                      {endorsement.message && (
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {endorsement.message}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-[var(--text-tertiary)]">
                        {formatDate(endorsement.createdAt)}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[var(--bg-default)] p-5 text-sm text-[var(--text-secondary)]">
                    Endorsements will appear here when peers back this skill.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
