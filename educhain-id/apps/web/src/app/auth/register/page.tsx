'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinishRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    
    // Auto-redirect to dashboard after 5 seconds on success
    setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display text-slate-900 dark:text-slate-100">
      
      {/* Decorative full-screen background for Success step */}
      {step === 3 && (
        <div className="fixed inset-0 pointer-events-none -z-10 opacity-50">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Standard Header (Steps 1 & 2) */}
      {step < 3 && (
        <div className="flex items-center p-4 pb-2 justify-between max-w-[480px] mx-auto w-full">
          <div 
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="flex size-12 shrink-0 items-center justify-start cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors -ml-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Sign Up</h2>
        </div>
      )}

      {/* --- STEP 1: Personal Information --- */}
      {step === 1 && (
        <>
          <div className="flex flex-col items-center px-4 pt-8 pb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
              <img 
                alt="EduChain Platform Logo" 
                className="w-16 h-16 object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCilIAHAREJOJa0y0awkHsWpQaMyZtncIOMjX8LV35NeM-Ijo1SUFJgUhqDHyUVOLlShmYZOKOMcLaKH8B4SCeZ2nbZ-Y-_tSfjAZEAPf8SsBY2INrCpMmMeiEzK18hYGrDVacfFfaHPaT6TLoG_gIkaTxhy1Vl7JlcKwmxpzCnPImqUH6WFxe0VAuj3NT9mExmBW4Uy3WqDmIbH5mHZWG0QP55OTBEUPwIpEmwyTYAldMCM5INUtaW-r1dDJw-ys5gecQUUHOZJWHV"
              />
            </div>
            <h1 className="tracking-tight text-3xl font-bold leading-tight text-center">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal pt-2 text-center">Step 1 of 2: Personal Information</p>
          </div>

          <form onSubmit={handleNextStep} className="flex flex-col gap-4 px-4 py-4 max-w-[480px] mx-auto w-full">
            {/* Full Name */}
            <label className="flex flex-col w-full">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">Full Name</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 placeholder:text-slate-400 pl-12 pr-4 text-base font-normal leading-normal transition-all" 
                  placeholder="Enter your full name" 
                  type="text" 
                  required
                />
              </div>
            </label>

            {/* Email */}
            <label className="flex flex-col w-full">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">Email Address</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 placeholder:text-slate-400 pl-12 pr-4 text-base font-normal leading-normal transition-all" 
                  placeholder="name@example.com" 
                  type="email" 
                  required
                />
              </div>
            </label>

            {/* Password */}
            <label className="flex flex-col w-full">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">Password</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="form-input flex w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 placeholder:text-slate-400 pl-12 pr-12 text-base font-normal leading-normal transition-all" 
                  placeholder="Create a strong password" 
                  type={showPassword ? "text" : "password"} 
                  required
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </label>

            <div className="pt-6">
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
              >
                Next Step
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="pt-4 pb-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline transition-colors">Sign In</Link>
              </p>
            </div>
          </form>

          {/* Progress Decor */}
          <div className="mt-auto px-4 pb-10 max-w-[480px] mx-auto w-full">
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-primary rounded-full transition-all duration-500"></div>
            </div>
          </div>
        </>
      )}

      {/* --- STEP 2: Identity Verification --- */}
      {step === 2 && (
        <div className="flex flex-col max-w-[480px] mx-auto w-full flex-1 relative animate-in slide-in-from-right-8 duration-300">
          
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-6 justify-between">
              <p className="text-base font-medium leading-normal">Identity Verification</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Step 2 of 2</p>
            </div>
            <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-2 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="flex flex-col px-4 pt-5">
            <h2 className="tracking-light text-[28px] font-bold leading-tight text-left pb-3">Verify your identity</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pb-6">
              To access EduChain courses and earn verified certificates, please upload a clear photo of your government-issued ID or valid student ID card.
            </p>
          </div>

          <form onSubmit={handleFinishRegistration} className="flex flex-col flex-1">
            <div className="flex flex-col p-4">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-14 hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {fileName ? (
                      <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                    )}
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className="text-lg font-bold leading-tight tracking-[-0.015em] text-center">
                      {fileName ? fileName : 'Upload ID Card'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center">
                      {fileName ? 'File selected' : 'JPG, PNG or PDF (Max 5MB)'}
                    </p>
                  </div>
                </div>
                {!fileName && (
                  <button type="button" className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow">
                    <span>Choose File</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col px-4 py-6 gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Requirements</h3>
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  ID must be valid and not expired
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  Your name and photo must be clearly visible
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  All four corners of the document must be in frame
                </li>
              </ul>
            </div>

            <div className="mt-auto p-4 flex flex-col gap-3 pb-8">
              <button 
                type="submit"
                disabled={!fileName}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[98%]"
              >
                <span className="truncate">Finish Registration</span>
              </button>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
                Your data is encrypted and stored securely according to our <Link href="/privacy" className="underline">privacy policy</Link>.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* --- STEP 3: Success --- */}
      {step === 3 && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-background-light dark:bg-background-dark z-50 animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Abstract Background Decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Celebration Icon */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center relative z-10 animate-bounce duration-1000">
                  <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
                </div>
                {/* Decorative Particles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary/40 rounded-full animate-pulse"></div>
                <div className="absolute top-4 -right-4 w-3 h-3 bg-primary/60 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 right-4 w-5 h-5 bg-primary/20 rounded-full animate-bounce delay-150"></div>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold mb-4 tracking-tight">
                Account Created Successfully!
              </h1>
              
              {/* Message */}
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                Welcome to the future of education. Your academic identity is now being secured on the blockchain, ensuring your achievements are permanent and verifiable.
              </p>

              {/* Verification Card Mockup */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-10 flex items-center gap-4 text-left shadow-sm">
                <div className="w-12 h-12 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Identity Status</div>
                  <div className="text-sm font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Syncing with Blockchain...
                  </div>
                </div>
                <div className="">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">verified_user</span>
                </div>
              </div>

              {/* Action Button */}
              <Link 
                href="/dashboard"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-lg transition-all duration-200 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group active:scale-[98%]"
              >
                Go to Dashboard
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              
              {/* Footer Link */}
              <p className="mt-8 text-sm text-slate-500 dark:text-slate-500">
                Taking you there in <span className="text-primary font-medium italic">5 seconds</span> or click above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
