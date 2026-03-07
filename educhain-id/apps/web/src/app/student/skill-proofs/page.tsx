'use client';

import React, { useState } from 'react';
import { useMySkillProofs, useMyEndorsements, useSubmitSkillProof } from '@/hooks/api';
import { Loader2, Plus, BadgeCheck, ExternalLink } from 'lucide-react';

const PROOF_TYPES = [
  { value: 'github_repository', label: 'GitHub Repository' },
  { value: 'hackathon_certificate', label: 'Hackathon Certificate' },
  { value: 'course_completion', label: 'Course Completion' },
  { value: 'project_contribution', label: 'Project Contribution' },
];

export default function SkillProofsPage() {
  const { data: proofs, isLoading: proofsLoading } = useMySkillProofs();
  const { data: endorsements, isLoading: endorsementsLoading } = useMyEndorsements();
  const submitProof = useSubmitSkillProof();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ skillName: '', proofType: 'github_repository', referenceUrl: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProof.mutate(
      {
        skillName: form.skillName,
        proofType: form.proofType,
        referenceUrl: form.referenceUrl || undefined,
        description: form.description || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ skillName: '', proofType: 'github_repository', referenceUrl: '', description: '' });
        },
      },
    );
  };

  const isLoading = proofsLoading || endorsementsLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">Skill Proofs &amp; Endorsements</h1>
          <p className="text-body text-[var(--text-secondary)] mt-1">
            Prove your skills with evidence and get endorsed by peers
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-[var(--color-accent)] text-white text-caption px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Proof
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Skill Name</label>
            <input
              type="text"
              value={form.skillName}
              onChange={(e) => setForm({ ...form, skillName: e.target.value })}
              required
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Proof Type</label>
            <select
              value={form.proofType}
              onChange={(e) => setForm({ ...form, proofType: e.target.value })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            >
              {PROOF_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Reference URL</label>
            <input
              type="url"
              value={form.referenceUrl}
              onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitProof.isPending}
            className="bg-[var(--color-accent)] text-white text-body px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {submitProof.isPending ? 'Submitting...' : 'Submit Proof'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : (
        <>
          {/* Skill Proofs */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-body-medium text-[var(--text-primary)] mb-4">My Skill Proofs</h2>
            {!proofs?.length ? (
              <p className="text-body text-[var(--text-tertiary)]">No skill proofs yet. Add your first proof above.</p>
            ) : (
              <div className="space-y-3">
                {proofs.map((proof: { id: string; skill: { name: string }; proofType: string; referenceUrl?: string; verificationStatus: string; createdAt: string }) => (
                  <div key={proof.id} className="flex items-center justify-between border border-[var(--border)] rounded-lg p-3">
                    <div>
                      <div className="text-body text-[var(--text-primary)] capitalize">{proof.skill.name}</div>
                      <div className="text-caption text-[var(--text-tertiary)]">
                        {proof.proofType.replace(/_/g, ' ')} &middot;{' '}
                        <span className={proof.verificationStatus === 'verified' ? 'text-[var(--color-success)]' : 'text-[var(--text-tertiary)]'}>
                          {proof.verificationStatus}
                        </span>
                      </div>
                    </div>
                    {proof.referenceUrl && (
                      <a href={proof.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)]">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Endorsements */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-body-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5" /> Endorsements Received
            </h2>
            {!endorsements?.length ? (
              <p className="text-body text-[var(--text-tertiary)]">No endorsements yet.</p>
            ) : (
              <div className="space-y-3">
                {endorsements.map((e: { id: string; skill: { name: string }; endorser: { fullName: string }; message?: string; createdAt: string }) => (
                  <div key={e.id} className="border border-[var(--border)] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body text-[var(--text-primary)] capitalize">{e.skill.name}</span>
                      <span className="text-caption text-[var(--text-tertiary)]">by {e.endorser.fullName}</span>
                    </div>
                    {e.message && <p className="text-caption text-[var(--text-secondary)] mt-1">{e.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
