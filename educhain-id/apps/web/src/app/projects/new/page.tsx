'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Github } from 'lucide-react';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/atoms/Alert';
import { useCreateProject } from '@/hooks/api';

export default function AddNewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    createProject.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        repoLink: repoLink.trim() || undefined,
      },
      {
        onSuccess: () => router.push('/projects'),
        onError: (mutationError: any) =>
          setError(mutationError?.message ?? 'We could not save your project right now.'),
      },
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] font-sans">
      <TopAppBar
        title="Add Project"
        showBack={true}
        onBack={() => router.back()}
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto max-w-3xl p-4 md:p-8">
        <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Portfolio Builder
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Publish proof of work, not just claims
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Add the project title, a concise summary, and a repository link if you have one. These details
            help reviewers connect your verified identity to actual output.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="space-y-5">
              <Input
                label="Project Title"
                placeholder="Decentralized identity wallet"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Description</span>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain what the project does, your role, and why it matters."
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-default)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </label>

              <Input
                label="Repository Link"
                type="url"
                placeholder="https://github.com/you/project"
                value={repoLink}
                onChange={(event) => setRepoLink(event.target.value)}
                icon={<Github className="h-4 w-4" />}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-sm">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Quality guidance</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Prioritize projects that make your skills easy to verify: shipped code, capstones,
                  research prototypes, or collaboration work with a clear scope.
                </p>
              </div>
            </div>
          </section>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => router.push('/projects')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              loading={createProject.isPending}
            >
              Save project
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
