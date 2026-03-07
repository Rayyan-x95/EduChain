'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EduChainLogo } from '../atoms/EduChainLogo';

interface VirtualStudentIDProps {
  name: string;
  institution: string;
  degree: string;
  graduationYear: string;
  avatar?: string | null;
  studentId: string;
  fieldsOfInterest?: string[];
  institutionVerified?: boolean;
  credentialVerified?: boolean;
  className?: string;
}

export function VirtualStudentID({
  name,
  institution,
  degree,
  graduationYear,
  avatar,
  studentId,
  fieldsOfInterest = [],
  institutionVerified = false,
  credentialVerified = false,
  className,
}: VirtualStudentIDProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[20px] w-full max-w-[400px]',
        'bg-[#0F172A]',
        'shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]',
        className,
      )}
    >
      {/* ── Ambient glow ── */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#2563EB] opacity-[0.07] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#22C55E] opacity-[0.05] blur-3xl pointer-events-none" />

      {/* ── Card body ── */}
      <div className="relative z-10 px-6 pt-6 pb-5">

        {/* Top bar: branding + avatar */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <EduChainLogo size={28} />
            <div>
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-white/90 leading-none">EduChain</p>
              <p className="text-[10px] font-medium text-white/40 leading-none mt-[3px] tracking-wide uppercase">Digital ID</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] border border-white/[0.06] flex items-center justify-center overflow-hidden shadow-lg">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[18px] font-semibold text-white/70">{initials}</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white leading-tight">{name}</h2>

        {/* Institution */}
        <p className="text-[13px] text-white/50 mt-1.5 leading-snug">{institution}</p>

        {/* Degree + Graduation */}
        <div className="mt-4 flex gap-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/30 mb-[3px]">Degree</p>
            <p className="text-[13px] font-medium text-white/80 leading-tight">{degree}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/30 mb-[3px]">Class of</p>
            <p className="text-[13px] font-medium text-white/80">{graduationYear}</p>
          </div>
        </div>

        {/* Fields of Interest */}
        {fieldsOfInterest.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/30 mb-[6px]">Fields of Interest</p>
            <div className="flex flex-wrap gap-1.5">
              {fieldsOfInterest.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center h-[22px] px-2.5 rounded-full text-[11px] font-medium bg-white/[0.06] text-white/60 border border-white/[0.04]"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Verification badge */}
        {institutionVerified && (
          <div className="mt-5 flex items-center gap-2">
            <div className="flex items-center justify-center h-[18px] w-[18px] rounded-full bg-[#22C55E]/15">
              <ShieldCheck className="h-3 w-3 text-[#22C55E]" aria-hidden="true" />
            </div>
            <span className="text-[12px] font-medium text-[#22C55E]/90">Verified by Institution</span>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ── QR Section ── */}
      <div className="relative z-10 px-6 py-5 flex items-center gap-4">
        <div className="h-[72px] w-[72px] rounded-xl bg-white p-1.5 shrink-0 shadow-sm">
          <QRCodeSVG
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${studentId}`}
            size={60}
            level="M"
            includeMargin={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/30">EduChain ID</p>
          <p className="text-[12px] font-mono font-medium text-white/60 mt-[2px] truncate">UUID: {studentId}</p>
          <p className="text-[10px] text-white/25 mt-1">Scan to view verified identity</p>
        </div>
      </div>

      {/* ── Holographic security strip ── */}
      <div
        className="relative h-[6px] w-full overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/40 via-[#22C55E]/30 via-[#A855F7]/25 via-[#F59E0B]/30 to-[#2563EB]/40 animate-holo-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
      </div>
    </div>
  );
}
