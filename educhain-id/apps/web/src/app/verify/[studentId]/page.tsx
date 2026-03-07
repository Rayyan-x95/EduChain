'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useVerifyStudent } from '@/hooks/api';
import { Loader2, ShieldCheck, ShieldX, Award, CheckCircle, XCircle } from 'lucide-react';
import { EduChainLogo } from '@/components/atoms/EduChainLogo';

export default function VerifyStudentPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { data: result, isLoading, error } = useVerifyStudent(studentId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--text-tertiary)] mx-auto" />
          <p className="text-body text-[var(--text-secondary)] mt-4">Verifying identity...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center max-w-md">
          <ShieldX className="h-12 w-12 text-[var(--color-danger)] mx-auto" />
          <h1 className="text-h2 text-[var(--text-primary)] mt-4">Verification Failed</h1>
          <p className="text-body text-[var(--text-secondary)] mt-2">
            Unable to verify this student identity. The ID may be invalid or the student may not exist.
          </p>
        </div>
      </div>
    );
  }

  const identity = result.identity;

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Branding */}
        <div className="flex items-center gap-2 justify-center mb-2">
          <EduChainLogo size={28} />
          <span className="text-body-medium text-[var(--text-secondary)]">EduChain ID</span>
        </div>

        {/* Verification badge */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
          <ShieldCheck className="h-12 w-12 text-[var(--color-success)] mx-auto" />
          <h1 className="text-h2 text-[var(--text-primary)] mt-3">Identity Verified</h1>
          <p className="text-caption text-[var(--text-tertiary)] mt-1">
            Verified at {new Date(result.verifiedAt).toLocaleString()}
          </p>
        </div>

        {/* Identity info */}
        {identity && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-h3 text-[var(--text-primary)]">{identity.fullName}</h2>
            {identity.username && (
              <p className="text-body text-[var(--text-secondary)]">@{identity.username}</p>
            )}
            <div className="flex gap-4 mt-3 text-caption text-[var(--text-tertiary)]">
              {identity.institution && <span>{identity.institution}</span>}
              {identity.degree && <span>{identity.degree}</span>}
              {identity.graduationYear && <span>Class of {identity.graduationYear}</span>}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <div className="text-body-medium text-[var(--text-primary)]">
                  {identity.verifiedCredentialCount}
                </div>
                <div className="text-caption text-[var(--text-tertiary)]">Credentials</div>
              </div>
              <div className="text-center">
                <div className="text-body-medium text-[var(--text-primary)]">
                  {identity.endorsementCount}
                </div>
                <div className="text-caption text-[var(--text-tertiary)]">Endorsements</div>
              </div>
              <div className="text-center">
                <div className="text-body-medium text-[var(--text-primary)]">
                  {identity.relationshipCount}
                </div>
                <div className="text-caption text-[var(--text-tertiary)]">Connections</div>
              </div>
            </div>
          </div>
        )}

        {/* Credential verification list */}
        {result.credentials?.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-body-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Verified Credentials
            </h2>
            <div className="space-y-3">
              {result.credentials.map(
                (cred: {
                  id: string;
                  title: string;
                  credentialType: string;
                  issuedDate: string;
                  institutionName: string;
                  signatureValid: boolean;
                }) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between border border-[var(--border)] rounded-lg p-3"
                  >
                    <div>
                      <div className="text-body text-[var(--text-primary)]">{cred.title}</div>
                      <div className="text-caption text-[var(--text-tertiary)]">
                        {cred.institutionName} &middot; {cred.credentialType} &middot;{' '}
                        {new Date(cred.issuedDate).toLocaleDateString()}
                      </div>
                    </div>
                    {cred.signatureValid ? (
                      <CheckCircle className="h-5 w-5 text-[var(--color-success)] shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[var(--color-danger)] shrink-0" />
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
