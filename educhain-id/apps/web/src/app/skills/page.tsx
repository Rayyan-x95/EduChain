'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/organisms/ErrorState';
import {
  useAddSkill,
  useMyEndorsements,
  useMySkillProofs,
  useMySkills,
  useRemoveSkill,
  useSkillAutocomplete,
} from '@/hooks/api';

type SkillRecord = { id: number; name: string };
type SkillProofRecord = {
  id: string;
  skillId: number;
  proofType: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
};
type EndorsementRecord = {
  id: string;
  skillId: number;
};

function formatSkillName(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export default function SkillsPage() {
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const skillsQuery = useMySkills();
  const proofsQuery = useMySkillProofs();
  const endorsementsQuery = useMyEndorsements();
  const suggestionsQuery = useSkillAutocomplete(draft);
  const addSkill = useAddSkill();
  const removeSkill = useRemoveSkill();

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

  const skillRows = useMemo(() => {
    const proofCounts = new Map<number, number>();
    const verifiedProofCounts = new Map<number, number>();
    const endorsementCounts = new Map<number, number>();

    proofs.forEach((proof) => {
      proofCounts.set(proof.skillId, (proofCounts.get(proof.skillId) ?? 0) + 1);
      if (proof.verificationStatus === 'verified') {
        verifiedProofCounts.set(proof.skillId, (verifiedProofCounts.get(proof.skillId) ?? 0) + 1);
      }
    });

    endorsements.forEach((endorsement) => {
      endorsementCounts.set(
        endorsement.skillId,
        (endorsementCounts.get(endorsement.skillId) ?? 0) + 1,
      );
    });

    return skills
      .map((skill) => ({
        ...skill,
        proofCount: proofCounts.get(skill.id) ?? 0,
        verifiedProofCount: verifiedProofCounts.get(skill.id) ?? 0,
        endorsementCount: endorsementCounts.get(skill.id) ?? 0,
      }))
      .sort((left, right) => {
        const leftScore = left.endorsementCount * 10 + left.verifiedProofCount * 3 + left.proofCount;
        const rightScore = right.endorsementCount * 10 + right.verifiedProofCount * 3 + right.proofCount;
        return rightScore - leftScore || left.name.localeCompare(right.name);
      });
  }, [endorsements, proofs, skills]);

  const topSkills = skillRows.slice(0, 3);
  const otherSkills = skillRows.slice(3);
  const suggestions = Array.isArray(suggestionsQuery.data)
    ? (suggestionsQuery.data as Array<{ name?: string | null }>).map((skill) => skill.name).filter(Boolean)
    : [];

  async function handleAddSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSkill = draft.trim();
    if (!nextSkill) return;

    setError(null);
    try {
      await addSkill.mutateAsync(nextSkill);
      setDraft('');
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add skill.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-default)]">
      <TopAppBar
        title="Skills & Endorsements"
        showBack
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Skill Inventory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Curate the signals behind your profile
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Skills become more credible when they are backed by proofs, peer endorsements, and
            project evidence instead of a plain keyword list.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleAddSkill}>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Add a skill like TypeScript, ZK proofs, or Figma"
                  icon={<Search className="h-4 w-4" />}
                />
                {suggestions.length > 0 && draft.trim().length >= 2 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="rounded-full border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-blue-600 hover:text-blue-600"
                        onClick={() => setDraft(suggestion ?? '')}
                      >
                        {formatSkillName(suggestion ?? '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={addSkill.isPending || draft.trim().length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                {addSkill.isPending ? 'Adding...' : 'Add Skill'}
              </Button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}
          </form>
        </section>

        {skillsQuery.isLoading || proofsQuery.isLoading || endorsementsQuery.isLoading ? (
          <section className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-slate-900/80"
              />
            ))}
          </section>
        ) : skillsQuery.isError || proofsQuery.isError || endorsementsQuery.isError ? (
          <ErrorState
            title="Skills unavailable"
            message="We couldn't load your skills and trust signals right now."
            onRetry={() => {
              void skillsQuery.refetch();
              void proofsQuery.refetch();
              void endorsementsQuery.refetch();
            }}
          />
        ) : skillRows.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
            Add your first skill to start building proof-backed trust.
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Top Signals</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Ranked by endorsements and proof depth
                </p>
              </div>

              {topSkills.map((skill) => (
                <article
                  key={skill.id}
                  className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                          {skill.verifiedProofCount > 0 ? 'Proof-backed' : 'Needs evidence'}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {skill.endorsementCount} endorsements • {skill.proofCount} proofs
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
                        {formatSkillName(skill.name)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        Open the detail view to review endorsements, attach repositories or
                        certificates, and strengthen this skill’s verification story.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/skills/${skill.id}`}>
                        <Button variant="outline">Open Detail</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        disabled={removeSkill.isPending}
                        onClick={() => removeSkill.mutate(skill.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {otherSkills.length > 0 && (
              <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">All Skills</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {otherSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-default)] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/skills/${skill.id}`}
                            className="text-lg font-bold text-[var(--text-primary)] hover:text-blue-600"
                          >
                            {formatSkillName(skill.name)}
                          </Link>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {skill.endorsementCount} endorsements • {skill.proofCount} proofs
                          </p>
                        </div>
                        {skill.verifiedProofCount > 0 && (
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
