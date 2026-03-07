'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Search, Building2, ShieldCheck, Loader2 } from 'lucide-react';
import { useInstitutionAutocomplete } from '@/hooks/api';

export default function InstitutionSelectPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const { data: institutions, isLoading } = useInstitutionAutocomplete(query || undefined);

  const filtered = (institutions ?? []) as Array<{ id: string; name: string; verificationStatus: boolean }>;

  return (
    <AuthLayout heading="Select Your Institution" subheading="Connect your account to your academic institution">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search institutions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />

        <div className="max-h-[320px] overflow-y-auto -mx-2 px-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-body text-[var(--text-secondary)] py-8">No institutions found</p>
          ) : (
            filtered.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setSelected(inst.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors ${
                  selected === inst.id
                    ? 'bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]'
                    : 'border border-transparent hover:bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[var(--bg-surface)] shrink-0">
                  <Building2 className="h-5 w-5 text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium text-[var(--text-primary)] truncate">{inst.name}</p>
                </div>
                {inst.verificationStatus && (
                  <Badge variant="verified">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-2"
          disabled={!selected}
          onClick={() => router.push('/auth/verify-student')}
        >
          Continue
        </Button>
      </div>
    </AuthLayout>
  );
}
