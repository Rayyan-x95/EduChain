'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    router.push('/dashboard');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <div 
          onClick={() => router.back()}
          className="flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors -ml-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">EduChain</h2>
      </div>

      {/* Hero Content */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <div className="w-24 h-24 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
          <img 
            alt="EduChain app logo" 
            className="w-16 h-16 object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo-jfKlWvLI9UZa3EoQrthaBpR8HZwjTuwZu47qviOiqEbqmcZ_GtXzZXf5p9KtQ975nA0vkYOa52rNTPGCZ1mQy7baAjCd1SSEhTvQoSkCyGAWV9pD7vghOuAtAJEeejFnvDVu2X5UgPu9O-ynySpA_6T-4_uCzvkDx_q2RcAvuIlCOFca_jFfDIRqOJwBO1OO19K8o0GH-cIZrZjpYHI5t9or5c_M1GfLDQ4rlW8JbUGWIKUXG0SZIfA5gIafTyPGXxTTEqt3QeQ"
          />
        </div>
        <h1 className="tracking-tight text-[32px] font-bold leading-tight px-4 text-center">Welcome Back</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal pb-6 pt-2 px-4 text-center max-w-sm">
          Enter your credentials to access your EduChain dashboard and courses.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 px-6 w-full max-w-md mx-auto">
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium leading-normal px-1">Email Address</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 pl-12 pr-4 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base font-normal transition-all" 
                placeholder="name@example.com" 
                type="email" 
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium leading-normal px-1">Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
              <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 pl-12 pr-12 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base font-normal transition-all" 
                placeholder="••••••••" 
                type={showPassword ? 'text' : 'password'}
                required
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                className="material-symbols-outlined absolute right-4 text-slate-400 cursor-pointer hover:text-primary transition-colors select-none"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end relative -top-1">
            <Link 
              href="/auth/forgot-password" 
              className="text-primary text-sm font-medium hover:underline transition-all"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[98%]"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 py-4">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">OR</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-3 pb-8">
          <button className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-[98%]">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pb-8 pt-6 px-4 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary font-bold hover:underline transition-colors">
            Create Account
          </Link>
        </p>
      </div>
      
    </div>
  );
}
