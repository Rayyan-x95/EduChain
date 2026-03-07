'use client';

import React from 'react';
import { VirtualStudentID } from '@/components/organisms/VirtualStudentID';

export default function IDCardShowcasePage() {
  return (
    <div className="min-h-screen bg-[#070B11] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#2563EB] opacity-[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#22C55E] opacity-[0.02] blur-[100px] pointer-events-none" />

      {/* Phone frame */}
      <div className="relative w-[390px] min-h-[780px] bg-[#0B1120] rounded-[44px] border border-white/[0.06] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-4 pb-2">
          <span className="text-[14px] font-semibold text-white/80">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/25">Your Digital Identity</p>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-white mt-1 leading-tight">EduChain ID</h1>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-start justify-center px-5 pt-6">
          <VirtualStudentID
            name="Mohammed Rayyan"
            institution="Dhaanish Ahmed College of Engineering – Chennai"
            degree="B.E Computer Science"
            graduationYear="2029"
            studentId="EDU-ID-3945A92"
            fieldsOfInterest={['Digital Marketing', 'Data Analytics']}
            institutionVerified={true}
            credentialVerified={true}
            className="w-full"
          />
        </div>

        {/* Bottom indicator */}
        <div className="flex justify-center pb-4 pt-6">
          <div className="w-[134px] h-[5px] rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}