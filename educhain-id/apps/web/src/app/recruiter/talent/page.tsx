'use client';

import React, { useState } from 'react';
import { useTalentSearch } from '@/hooks/api';
import { Loader2, Search, Star, Award, BadgeCheck } from 'lucide-react';

export default function TalentDiscoveryPage() {
  const [filters, setFilters] = useState({
    skills: '',
    institution: '',
    graduation_year: undefined as number | undefined,
    min_score: undefined as number | undefined,
    page: 1,
  });

  const { data, isLoading } = useTalentSearch(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--text-primary)]">AI Talent Discovery</h1>
        <p className="text-body text-[var(--text-secondary)] mt-1">
          Find top talent ranked by verified credentials, endorsements, and contributions
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={filters.skills}
              onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
              placeholder="react,typescript"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Institution</label>
            <input
              type="text"
              value={filters.institution}
              onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
              placeholder="MIT"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Graduation Year</label>
            <input
              type="number"
              value={filters.graduation_year ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, graduation_year: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
              placeholder="2025"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="text-caption text-[var(--text-secondary)] block mb-1">Min Score</label>
            <input
              type="number"
              min={0}
              max={100}
              value={filters.min_score ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, min_score: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
              placeholder="50"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-body text-[var(--text-primary)]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center gap-2 bg-[var(--color-accent)] text-white text-body px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Search className="h-4 w-4" /> Search Talent
        </button>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : data?.results?.length ? (
        <>
          <p className="text-caption text-[var(--text-tertiary)]">
            {data.total} result{data.total !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-4">
            {data.results.map(
              (student: {
                studentId: string;
                fullName: string;
                institution: string | null;
                degree: string | null;
                graduationYear: number | null;
                topSkills: string[];
                verifiedCredentialCount: number;
                endorsementCount: number;
                talentScore: number;
              }) => (
                <div
                  key={student.studentId}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-medium text-[var(--text-primary)]">{student.fullName}</h3>
                    </div>
                    <div className="flex gap-3 mt-1 text-caption text-[var(--text-tertiary)]">
                      {student.institution && <span>{student.institution}</span>}
                      {student.degree && <span>{student.degree}</span>}
                      {student.graduationYear && <span>Class of {student.graduationYear}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {student.topSkills.map((s) => (
                        <span
                          key={s}
                          className="bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-caption px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3 text-caption text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {student.verifiedCredentialCount} credentials</span>
                      <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> {student.endorsementCount} endorsements</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[var(--color-success-subtle)] text-[var(--color-success)] text-body-medium px-3 py-1.5 rounded-lg shrink-0 ml-4">
                    <Star className="h-4 w-4" />
                    {student.talentScore}
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Pagination */}
          {data.total > (filters.page * 20) && (
            <div className="flex justify-center">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="text-[var(--color-accent)] text-body hover:underline"
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-body text-[var(--text-tertiary)]">
            No talent found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
