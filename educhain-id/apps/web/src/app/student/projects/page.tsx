'use client';

import React from 'react';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/organisms/Shared';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';
import { useMyProjects, useCreateProject } from '@/hooks/api';

export default function StudentProjectsPage() {
  const { data: projects, isLoading } = useMyProjects();
  const createProject = useCreateProject();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">Projects</h1>
          <p className="text-body text-[var(--text-secondary)] mt-1">Your collaborative projects</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>New Project</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="No projects yet"
          description="Create your first project to start collaborating with other students."
          action={{ label: 'Create Project', onClick: () => {} }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project: any) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description ?? ''}
              techStack={project.techStack ?? []}
              memberCount={project.memberCount ?? 0}
              status={project.status as 'active' | 'completed'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
