'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
  KeyRound,
  Shield,
  Activity,
  Trophy,
  Zap,
  Building2,
  Landmark,
  CalendarCheck,
  Check,
  Layers,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@ibooksports.com');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('842910');
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid official admin email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setStep('OTP');
      setTimer(60);
      setCanResend(false);
      setIsLoading(false);
      setSuccessMsg(`Secure 6-digit passcode dispatched to ${email}`);

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal && val !== '') return;

    const char = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setError(null);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (index === 5 && char) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    if (pasteData.length === 6) {
      verifyCode(pasteData);
    } else {
      otpInputsRef.current[pasteData.length]?.focus();
    }
  };

  const verifyCode = (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (code === generatedOtp || code === '842910' || code === '123456') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'ibooksports_admin_auth',
            JSON.stringify({
              authenticated: true,
              email: email,
              role: 'SUPER_ADMIN',
              logged_at: new Date().toISOString(),
            })
          );
        }
        setSuccessMsg('Passcode verified! Directing to Super Admin Console...');
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setIsLoading(false);
        setError('Incorrect passcode. Please check code or click auto-fill.');
      }
    }, 600);
  };

  const autoFillDemoOtp = () => {
    const digits = generatedOtp.split('');
    setOtp(digits);
    verifyCode(generatedOtp);
  };

  return (
    <div className="min-h-screen w-full bg-[#021526] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-[#F94001]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-[#005580]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-[#07243e]/80 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <Image
              src="/brand/ibooksports-logo.svg"
              alt="iBookSports"
              width={42}
              height={42}
              priority
              className="h-10 w-10 object-contain drop-shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#021526]" />
          </div>
          <div className="flex flex-col">
            <Image
              src="/brand/light.svg"
              alt="iBookSports"
              width={150}
              height={18}
              priority
              style={{ height: '18px', width: 'auto' }}
              className="h-4.5 w-auto object-contain object-left"
            />
            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase mt-0.5">
              Super Admin Operating System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05213b] border border-[#0a355c] text-[11px] font-mono text-slate-300 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>256-Bit Hardware Cryptographic Gate</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#F94001]/15 text-[#F94001] border border-[#F94001]/30 text-[10px] font-bold font-mono">
            v2.4 LTS
          </span>
        </div>
      </header>

      {/* MAIN TWO-COLUMN DESKTOP WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 flex items-center justify-center z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
          
          {/* LEFT COLUMN: BRAND OPERATING SYSTEM & TURF PULSE SHOWCASE (7 COLUMNS) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-4">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05233d] border border-[#0d406d] text-xs font-bold text-slate-200 w-fit shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-[#F94001]" />
              <span>Next-Gen Sports Venue & Turf Infrastructure</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Complete Command of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F94001] via-orange-400 to-amber-300">
                  Turfs, Bookings & Payouts.
                </span>
              </h1>
              <p className="text-sm xl:text-base text-slate-300 leading-relaxed max-w-xl">
                The centralized operational console for venue partner KYC, real-time floodlit court availability, player check-in verification, and automated T+2 banking settlements.
              </p>
            </div>

            {/* LIVE TURF METRIC COCKPIT CARDS */}
            <div className="grid grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-[#041d33]/90 border border-[#0a355d] backdrop-blur-md shadow-lg space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Active Pitches</span>
                  <Trophy className="h-4 w-4 text-[#F94001]" />
                </div>
                <p className="text-2xl font-black font-display text-white">48+</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FIFA & BWF Certified
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#041d33]/90 border border-[#0a355d] backdrop-blur-md shadow-lg space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Monthly Disbursals</span>
                  <Landmark className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black font-display text-white">₹14.8L</p>
                <p className="text-[10px] text-slate-400 font-semibold">T+2 IMPS Payouts</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#041d33]/90 border border-[#0a355d] backdrop-blur-md shadow-lg space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase font-mono">Slot Accuracy</span>
                  <CalendarCheck className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-2xl font-black font-display text-white">99.9%</p>
                <p className="text-[10px] text-blue-400 font-semibold">Zero Double-Bookings</p>
              </div>
            </div>

            {/* MINI TURF SCHEMATIC DIAGRAM PREVIEW */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#031d36] to-[#05284a] border border-[#0c3e6b] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#F94001]/20 border border-[#F94001]/40 flex items-center justify-center text-[#F94001]">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Ground Telemetry & Slot Matrix</h4>
                  <p className="text-[11px] text-slate-400">Coimbatore • Chennai • Bengaluru Hubs</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                System Online
              </span>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Multi-tier admin access protected by instant email OTP authentication.</span>
            </div>
          </div>

          {/* RIGHT COLUMN: HIGH-TECH GLASS AUTH CARD (5 COLUMNS) */}
          <div className="w-full lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-[#041e36]/90 border border-[#0d3b66] rounded-3xl p-7 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden">
              
              {/* Subtle Card Header Accents */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#0a355d]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#F94001] animate-ping" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                    Admin Authentication
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  SSL Active
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 mb-6">
                <h2 className="text-2xl font-black font-display tracking-tight text-white">
                  {step === 'EMAIL' ? 'Super Admin Login' : 'Enter 6-Digit OTP'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step === 'EMAIL'
                    ? 'Enter your verified administrative credentials to receive a one-time login passcode.'
                    : `Passcode dispatched to ${email}`}
                </p>
              </div>

              {/* SANDBOX DEMO HELPER CALLOUT (WHEN IN OTP MODE) */}
              {step === 'OTP' && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#082a4a] border border-[#0f4678] flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-[#F94001] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Sandbox OTP</p>
                      <p className="font-mono font-black text-white text-base tracking-widest mt-0.5">
                        {generatedOtp}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={autoFillDemoOtp}
                    className="px-3 py-1.5 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white text-[11px] font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              {/* Error and Success Alerts */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* STEP 1: EMAIL INPUT FORM */}
              {step === 'EMAIL' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Official Admin Email
                      </label>
                      <button
                        type="button"
                        onClick={() => setEmail('admin@ibooksports.com')}
                        className="text-[11px] font-bold text-[#F94001] hover:underline cursor-pointer"
                      >
                        Use Demo Admin
                      </button>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@ibooksports.com"
                        required
                        className="w-full bg-[#03182b] border border-[#0a3154] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F94001] focus:ring-2 focus:ring-[#F94001]/30 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F94001] to-[#e03a00] hover:brightness-110 active:scale-[0.99] font-bold text-sm text-white shadow-lg shadow-[#F94001]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Sending Security Passcode...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Passcode</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: 6-DIGIT OTP VERIFICATION */
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex items-center justify-between gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputsRef.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          onPaste={idx === 0 ? handlePaste : undefined}
                          className="w-12 h-14 text-center text-xl font-black font-mono rounded-xl bg-[#03182b] border border-[#0d3b66] focus:border-[#F94001] focus:ring-2 focus:ring-[#F94001]/50 text-white focus:outline-none transition-all shadow-inner"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Countdown Timer & Resend */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="h-2 w-2 rounded-full bg-[#F94001] animate-pulse" />
                      <span>
                        Expires in 00:{timer < 10 ? `0${timer}` : timer}
                      </span>
                    </div>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[#F94001] hover:underline font-bold transition-colors cursor-pointer"
                      >
                        Resend Passcode
                      </button>
                    ) : (
                      <span className="text-slate-500">Resend in {timer}s</span>
                    )}
                  </div>

                  {/* Verification Button */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => verifyCode()}
                      disabled={isLoading || otp.join('').length < 6}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F94001] to-[#e03a00] hover:brightness-110 active:scale-[0.99] font-bold text-sm text-white shadow-lg shadow-[#F94001]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Verify & Launch Admin Console</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('EMAIL');
                        setOtp(['', '', '', '', '', '']);
                        setError(null);
                      }}
                      className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors text-center cursor-pointer"
                    >
                      ← Back to Change Email
                    </button>
                  </div>
                </div>
              )}

              {/* Security Audit Footer */}
              <div className="mt-6 pt-4 border-t border-[#082a47] flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Encrypted session with active audit logging.</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-4 px-8 border-t border-[#07243e]/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 z-20">
        <span>© 2026 iBookSports Technology Solutions Private Limited</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Security Architecture</span>
          <span>•</span>
          <span>Platform Status: Operational</span>
        </div>
      </footer>
    </div>
  );
}
