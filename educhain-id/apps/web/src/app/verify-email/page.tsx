'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Auto-backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => !/^\d$/.test(char))) return;
    
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const isFormComplete = otp.every(digit => digit !== '');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormComplete) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      <TopAppBar 
        showBack={true} 
        onBack={() => router.back()}
        title="Verify your email" 
      />

      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-6 max-w-md mx-auto w-full">
        
        {/* Hero Illustration */}
        <div className="w-24 h-24 rounded-full bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center mb-8 relative">
          <span className="material-symbols-outlined text-4xl text-blue-600">mark_email_unread</span>
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-slate-950 animate-ping"></div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We sent a verification code to your university email address.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="w-full flex-1 flex flex-col">
          <div className="flex flex-col items-center space-y-6">
            
            {/* OTP Input */}
            <div className="flex items-center justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="0"
                />
              ))}
            </div>

            <p className="text-sm text-slate-500">
              Didn't receive the code?{' '}
              <button type="button" className="text-blue-600 font-semibold hover:underline">Resend</button>
            </p>
          </div>

          <div className="mt-auto space-y-4 w-full pt-8">
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              className="py-4 h-auto rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/20"
              disabled={!isFormComplete}
            >
              <span className="material-symbols-outlined">verified_user</span>
              Verify Email
            </Button>
            
            <p className="text-xs text-center text-slate-500">
              By verifying, you agree to our <Link href="/terms" className="hover:text-blue-600 underline">Terms of Service</Link> and <Link href="/privacy" className="hover:text-blue-600 underline">Privacy Policy</Link>.
            </p>
          </div>
        </form>

      </main>
    </div>
  );
}