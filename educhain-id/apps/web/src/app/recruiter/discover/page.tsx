'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchFilterPanel, type FilterState } from '@/components/organisms/SearchFilterPanel';
import { RecruiterStudentCard } from '@/components/molecules/RecruiterStudentCard';
import { Loader2 } from 'lucide-react';
import { useSearchStudents, useAddToShortlist, useRemoveFromShortlist, useShortlist, useSkillAutocomplete } from '@/hooks/api';

export default function RecruiterDiscoverPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ skills: [], institution: '', year: '', verifiedOnly: false });
  const { data: searchResult, isLoading } = useSearchStudents({
    q: query,
    skills: filters.skills.length > 0 ? filters.skills : undefined,
    institution: filters.institution || undefined,
  });
  const { data: shortlist } = useShortlist();
  const { data: skillOptions } = useSkillAutocomplete('');
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const router = useRouter();

  const students = searchResult?.results ?? [];
  const shortlistedIds = new Set((shortlist ?? []).map((s: any) => s.studentId ?? s.id));
  const availableSkills = (skillOptions ?? []).map((s: any) => s.name ?? s);

  const toggleShortlist = (id: string) => {
    if (shortlistedIds.has(id)) {
      removeFromShortlist.mutate(id);
    } else {
      addToShortlist.mutate({ studentId: id });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-[var(--text-primary)]">Discover Students</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">Find and shortlist qualified candidates</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <SearchFilterPanel
          availableSkills={availableSkills.length > 0 ? availableSkills : ['React', 'TypeScript', 'Python', 'Java', 'TensorFlow', 'Docker', 'SQL', 'Rust']}
          availableInstitutions={[]}
          availableYears={['2023', '2024', '2025', '2026']}
          onSearch={setQuery}
          onFilter={setFilters}
          onClear={() => { setQuery(''); setFilters({ skills: [], institution: '', year: '', verifiedOnly: false }); }}
          className="lg:w-[280px] lg:shrink-0"
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student: any) => (
                <RecruiterStudentCard
                  key={student.id}
                  name={student.name}
                  institution={student.institution}
                  degree={student.degree ?? ''}
                  skills={student.skills ?? []}
                  verified={student.verified ?? false}
                  avatar={student.avatar ?? null}
                  shortlisted={shortlistedIds.has(student.id)}
                  onShortlist={() => toggleShortlist(student.id)}
                  onView={() => router.push(`/recruiter/candidates/${student.id}`)}
                />
              ))}
              {students.length === 0 && !isLoading && (
                <p className="col-span-full text-center text-body text-[var(--text-secondary)] py-12">
                  No students found. Try adjusting your filters.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
