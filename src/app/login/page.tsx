"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  Building,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both candidate username and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await signIn("credentials", {
        username: username.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        const errorMsg =
          res?.error === "CredentialsSignin"
            ? "Invalid username or password"
            : res?.error || "Invalid username or password";
        setError(errorMsg);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login attempt exception:", err);
      setError(err?.message || "An unexpected error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* ============================================================ */}
      {/* LEFT SECTION: Clean Candidate Sign-In Form (Quick Fill Removed)*/}
      {/* ============================================================ */}
      <div className="w-full lg:w-[46%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 bg-white shadow-lg lg:shadow-none">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <BrandLogo size="md" href="/" showSubtitle={false} theme="light" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-10">
          <div className="mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest mb-3.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Candidate Portal Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Sign In to CBT Exam Hall
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Enter your assigned candidate credentials to access official 200-question NBE mock tests, question palettes & performance diagnostics.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1.5">
                Candidate Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your candidate username"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium shadow-xs"
                />
              </div>
            </div>

            {/* Password Input with Eye / EyeOff Icon */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                  title={showPassword ? "Hide Password" : "Show Password"}
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Candidate...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to CBT Portal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Protected by NextAuth JWT</span>
          <span className="font-semibold text-slate-500">Standardized +1.00 / −0.25 CBT</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SECTION: Authentic CBT Examination Hall Image Showcase */}
      {/* ============================================================ */}
      <div className="hidden lg:flex w-full lg:w-[54%] xl:w-[58%] relative bg-slate-950 overflow-hidden items-end">
        {/* Background Examination Hall Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/cbt-exam-hall.jpg"
            alt="Candidate actively taking Computer Based Test in examination hall"
            fill
            priority
            sizes="(max-width: 1200px) 50vw, 60vw"
            className="object-cover object-center"
          />
          {/* Subtle Top and Bottom Vignette Overlays for Maximum Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
          <div className="absolute inset-0 bg-blue-950/20 mix-blend-multiply" />
        </div>

        {/* Top Overlay Badge Bar */}
        <div className="absolute top-8 left-8 right-8 z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official CBT Examination Center · NBEMS Junior Assistant</span>
          </div>

          <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>180-Min Continuous Countdown</span>
          </div>
        </div>

        {/* Bottom Overlay Glassmorphic Information Card */}
        <div className="relative z-20 w-full p-8 xl:p-10">
          <div className="rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-300 block mb-1">
                  1:1 Test Hall Fidelity
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Authentic Computer-Based Test Simulation
                </h3>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-xl font-mono text-xs font-black">
                <CheckCircle2 className="w-4 h-4" />
                <span>150+ Qualifying Benchmark</span>
              </div>
            </div>

            {/* Examination Specifications Grid */}
            <div className="grid grid-cols-4 gap-3 text-center pt-1">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                <span className="text-base sm:text-lg font-black font-mono text-white">200 MCQs</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                <span className="text-base sm:text-lg font-black font-mono text-white">180 Mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sections</span>
                <span className="text-base sm:text-lg font-black font-mono text-white">4 × 50</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Negative Mark</span>
                <span className="text-base sm:text-lg font-black font-mono text-rose-400">−0.25 Mark</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">
              Exact replica of the National Board of Examinations in Medical Sciences CBT testing interface with 5-column palette, sectional navigation, and post-submission score analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
