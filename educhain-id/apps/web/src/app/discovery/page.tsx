'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/atoms/Alert';
import { StudentCard } from '@/components/molecules/StudentCard';
import { CollaborationModal } from '@/components/organisms/CollaborationModal';
import { SearchFilterPanel, type FilterState } from '@/components/organisms/SearchFilterPanel';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { useSearchStudents, useSendCollaboration } from '@/hooks/api';

export default function DiscoveryPage() {
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    institution: '',
    year: '',
    verifiedOnly: false,
  });
  const [collaborationError, setCollaborationError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    institution: string;
  } | null>(null);
  const router = useRouter();
  const sendCollaboration = useSendCollaboration();

  const params = useMemo(
    () => ({
      q: q || undefined,
      skills: filters.skills.length ? filters.skills : undefined,
      institution: filters.institution || undefined,
      graduationYear: filters.year ? Number(filters.year) : undefined,
      verifiedOnly: filters.verifiedOnly,
    }),
    [q, filters],
  );

  const { data, isLoading, isError, refetch } = useSearchStudents(params);

  const students = (data?.results ?? []) as Array<{
    student_id: string;
    full_name: string;
    institution?: string | null;
    top_skills?: string[];
    verified_credential_count?: number;
  }>;

  return (
    <div className="min-h-screen bg-[var(--bg-default)] font-sans pb-24">
      <TopAppBar
        title="Discover Students"
        className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]"
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:p-8 lg:grid-cols-[320px_1fr]">
        <SearchFilterPanel
          availableSkills={['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX', 'Solidity']}
          availableInstitutions={['Stanford University', 'MIT', 'IIT', 'Oxford']}
          availableYears={['2026', '2027', '2028']}
          onSearch={(next) => setQ(next)}
          onFilter={(next) => setFilters(next)}
          onClear={() => {
            setQ('');
            setFilters({ skills: [], institution: '', year: '', verifiedOnly: false });
          }}
          className="h-max lg:sticky lg:top-24"
        />

        <section className="flex flex-col gap-4">
          {collaborationError ? <Alert variant="error">{collaborationError}</Alert> : null}

          {isLoading ? (
            <div className="text-body text-[var(--text-secondary)]">Loading students...</div>
          ) : null}

          {isError ? (
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
              <div className="text-body-medium text-[var(--text-primary)]">Could not load students</div>
              <button
                className="mt-2 text-body-medium text-[var(--color-primary)]"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && students.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-[var(--text-secondary)]">
              No students match your search.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {students.map((student) => (
              <StudentCard
                key={student.student_id}
                name={student.full_name}
                institution={student.institution ?? 'Unknown institution'}
                skills={student.top_skills ?? []}
                verified={(student.verified_credential_count ?? 0) > 0}
                onViewProfile={() => router.push(`/verify/${student.student_id}`)}
                onCollaborate={() => {
                  setCollaborationError('');
                  setSelectedStudent({
                    id: student.student_id,
                    name: student.full_name,
                    institution: student.institution ?? 'Unknown institution',
                  });
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <CollaborationModal
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        targetStudent={{
          name: selectedStudent?.name ?? '',
          institution: selectedStudent?.institution ?? '',
          avatar: null,
        }}
        onSend={async (message) => {
          if (!selectedStudent) return;
          try {
            await sendCollaboration.mutateAsync({
              receiverId: selectedStudent.id,
              message,
            });
            setCollaborationError('');
            setSelectedStudent(null);
          } catch (error: any) {
            setCollaborationError(
              error?.message ?? 'We could not send the collaboration request right now.',
            );
            throw error;
          }
        }}
      />
    </div>
  );
}
