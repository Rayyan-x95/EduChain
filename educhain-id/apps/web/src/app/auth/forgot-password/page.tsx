'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display">
        {/* Background */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-5xl">mark_email_read</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-white dark:border-slate-900">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4 mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Check Your Email
              </h1>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We've sent a password reset link to{' '}
                <span className="text-primary font-medium">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={`mailto:${email}`}
                className="flex w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 items-center justify-center gap-2 active:scale-[98%]"
              >
                <span className="material-symbols-outlined text-xl">open_in_new</span>
                <span>Open Email App</span>
              </a>
              <Link
                href="/auth/login"
                className="block w-full text-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium py-2 transition duration-200"
              >
                Back to Sign In
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary font-semibold hover:underline ml-1"
                >
                  Click to resend
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="relative w-full max-w-[480px] flex flex-col overflow-hidden">

        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Back button */}
        <div className="flex items-center p-4 pb-2">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pt-8 pb-4 relative">
          <div className="mb-8 flex justify-center lg:justify-start">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
            </div>
          </div>

          <h1 className="tracking-tight text-[32px] font-bold leading-tight text-left pb-3">
            Forgot Password?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed pb-6 text-left">
            No worries, it happens! Enter your email address below and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold leading-normal" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">mail</span>
                </div>
                <input
                  className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus:border-primary h-14 pl-12 pr-4 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base font-normal transition-all"
                  id="email"
                  name="email"
                  placeholder="example@educhain.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-lg shadow-primary/20 active:scale-[98%]"
            >
              <span className="truncate">Send Reset Link</span>
            </button>

            <div className="mt-2 text-center">
              <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-primary hover:underline ml-1">Log in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
