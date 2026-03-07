'use client';

import React, { useState } from 'react';
import { SearchFilterPanel } from '@/components/organisms/SearchFilterPanel';
import { StudentCard } from '@/components/molecules/StudentCard';
import { Loader2 } from 'lucide-react';
import { useSearchStudents } from '@/hooks/api';

export default function StudentSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');

  const { data: searchResult, isLoading } = useSearchStudents({
    q: query,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    institution: selectedInstitution || undefined,
  });

  const students = searchResult?.results ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">Find Students</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">Search and connect with other students</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <SearchFilterPanel
          availableSkills={['React', 'TypeScript', 'Python', 'Java', 'TensorFlow', 'Docker', 'SQL', 'Rust']}
          availableInstitutions={['MIT', 'Stanford', 'Harvard']}
          availableYears={['2023', '2024', '2025']}
          className="lg:w-[280px] lg:shrink-0"
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student: any) => (
                <StudentCard
                  key={student.id}
                  name={student.name}
                  institution={student.institution}
                  skills={student.skills ?? []}
                  verified={student.verified ?? false}
                  avatar={student.avatar ?? null}
                  onViewProfile={() => {}}
                  onCollaborate={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
