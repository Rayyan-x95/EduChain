'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Chip } from '../atoms/Chip';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchFilterPanelProps {
  availableSkills: string[];
  availableInstitutions: string[];
  availableYears: string[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterState) => void;
  onClear?: () => void;
  className?: string;
}

export interface FilterState {
  skills: string[];
  institution: string;
  year: string;
  verifiedOnly: boolean;
}

export function SearchFilterPanel({
  availableSkills,
  availableInstitutions,
  availableYears,
  onSearch,
  onFilter,
  onClear,
  className,
}: SearchFilterPanelProps) {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const toggleSkill = (skill: string) => {
    const next = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(next);
    onFilter?.({ skills: next, institution: selectedInstitution, year: selectedYear, verifiedOnly });
  };

  const handleClear = () => {
    setQuery('');
    setSelectedSkills([]);
    setSelectedInstitution('');
    setSelectedYear('');
    setVerifiedOnly(false);
    onClear?.();
  };

  return (
    <aside className={cn('flex flex-col gap-6', className)}>
      <Input
        placeholder="Search students..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      {/* Skills */}
      <div>
        <h4 className="text-overline uppercase text-[var(--text-tertiary)] mb-2">Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {availableSkills.map((skill) => (
            <Chip
              key={skill}
              selected={selectedSkills.includes(skill)}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Chip>
          ))}
        </div>
      </div>

      {/* Institution */}
      <div>
        <h4 className="text-overline uppercase text-[var(--text-tertiary)] mb-2">Institution</h4>
        <select
          className="w-full h-10 px-3 text-body bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)]"
          value={selectedInstitution}
          onChange={(e) => {
            setSelectedInstitution(e.target.value);
            onFilter?.({ skills: selectedSkills, institution: e.target.value, year: selectedYear, verifiedOnly });
          }}
        >
          <option value="">All Institutions</option>
          {availableInstitutions.map((inst) => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>
      </div>

      {/* Graduation Year */}
      <div>
        <h4 className="text-overline uppercase text-[var(--text-tertiary)] mb-2">Graduation Year</h4>
        <div className="flex flex-wrap gap-1.5">
          {availableYears.map((year) => (
            <Chip
              key={year}
              selected={selectedYear === year}
              onClick={() => {
                const next = selectedYear === year ? '' : year;
                setSelectedYear(next);
                onFilter?.({ skills: selectedSkills, institution: selectedInstitution, year: next, verifiedOnly });
              }}
            >
              {year}
            </Chip>
          ))}
        </div>
      </div>

      {/* Verified Only */}
      <div className="flex items-center justify-between">
        <span className="text-body-medium text-[var(--text-primary)]">Verified Only</span>
        <button
          role="switch"
          aria-checked={verifiedOnly}
          onClick={() => {
            const next = !verifiedOnly;
            setVerifiedOnly(next);
            onFilter?.({ skills: selectedSkills, institution: selectedInstitution, year: selectedYear, verifiedOnly: next });
          }}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-normal',
            verifiedOnly ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-surface)]',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-normal',
              verifiedOnly ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" size="sm" onClick={handleClear} className="flex-1">
          Clear Filters
        </Button>
      </div>
    </aside>
  );
}
