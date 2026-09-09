"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Award,
  BookOpen,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick fill helper
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

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
        setError(res?.error || "Invalid username or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* ============================================================ */}
      {/* LEFT SECTION: High-Converting Candidate Login Form           */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 bg-white">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <BrandLogo size="md" href="/" showSubtitle={false} theme="light" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Login Box */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Candidate Portal Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Sign In to CBT Exam Hall
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter your assigned candidate credentials to access official 200-question NBE mock tests, question palettes & performance diagnostics.
            </p>
          </div>

          {/* Quick Account Autofill Chips */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
              Quick Test Credentials:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill("sunil", "nbe2026")}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-700 hover:text-blue-700 transition shadow-xs"
              >
                sunil (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("admin", "admin123")}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[11px] font-bold text-slate-700 hover:text-amber-800 transition shadow-xs"
              >
                admin (Official)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("candidate1", "nbe2026")}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition shadow-xs"
              >
                candidate1 (Student)
              </button>
            </div>
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
                  placeholder="e.g. sunil, candidate1"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                />
              </div>
            </div>

            {/* Password Input with Eye / EyeOff Icon */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Default: nbe2026 / admin123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
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
              className="w-full mt-2 py-3.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
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
      {/* RIGHT SECTION: CBT Examination Cockpit & Simulator Showcase  */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[52%] xl:w-[55%] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-10 lg:p-12 xl:p-14 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Background Glowing Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Right Header Pill */}
        <div className="flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-blue-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Board of Examinations Simulator</span>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            NBEMS Jr. Assistant 2026
          </span>
        </div>

        {/* Center: Live CBT Simulation Interface Mockup */}
        <div className="my-auto py-8 relative z-10 space-y-5">
          {/* Main CBT Exam Room Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl p-5 sm:p-6 backdrop-blur-xl">
            {/* Header: Timer + Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-xs">
                  CBT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Full-Length Mock Paper</h3>
                  <p className="text-[10px] text-slate-400">Section I of IV · Single Answer MCQ</p>
                </div>
              </div>

              {/* 180-min Countdown Timer with Tabular Numerals */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-tabular font-mono text-xs font-black shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>02:59:48</span>
              </div>
            </div>

            {/* Section Pills */}
            <div className="flex overflow-x-auto gap-1.5 py-3 border-b border-slate-800 text-[11px] no-scrollbar">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold whitespace-nowrap">
                Reasoning (50)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold whitespace-nowrap">
                General Awareness (50)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold whitespace-nowrap">
                Quantitative (50)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-semibold whitespace-nowrap">
                English (50)
              </span>
            </div>

            {/* Sample Question Box */}
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono font-bold text-blue-300">Question 14 / 200</span>
                <span className="text-emerald-400 font-mono font-bold">+1.00 / −0.25</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                In a certain coding system, if &apos;EXAM&apos; is coded as &apos;FYBN&apos;, how will &apos;ARENA&apos; be represented in the identical pattern?
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-200 font-bold flex items-center justify-between">
                  <span>(A) BSFOB</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <span>(B) BSENB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <span>(C) BRFOB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <span>(D) ASGNA</span>
                </div>
              </div>
            </div>

            {/* Miniature 5-Column Question Palette Snippet */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span>5-Column Question Palette</span>
                <span className="text-emerald-400">14 Answered</span>
              </div>
              <div className="grid grid-cols-10 gap-1 text-[10px] font-mono font-bold text-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => {
                  let bg = "bg-slate-800 text-slate-400";
                  if (num <= 10) bg = "bg-emerald-600 text-white font-black"; // answered
                  else if (num === 11 || num === 12) bg = "bg-rose-600 text-white font-black"; // unanswered
                  else if (num === 13) bg = "bg-purple-600 text-white font-black"; // marked
                  else if (num === 14) bg = "bg-blue-600 text-white font-black ring-2 ring-blue-300"; // current

                  return (
                    <div key={num} className={`py-1 rounded-md ${bg}`}>
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Exam Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
              <span className="text-lg font-black font-mono text-white">200 MCQs</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="text-lg font-black font-mono text-white">180 Mins</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Penalty</span>
              <span className="text-lg font-black font-mono text-rose-400">−0.25 Mark</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Benchmark</span>
              <span className="text-lg font-black font-mono text-emerald-400">150+ Target</span>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Authentic NBE Junior Assistant CBT Hall</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v2.0 Standard</span>
        </div>
      </div>
    </div>
  );
}
