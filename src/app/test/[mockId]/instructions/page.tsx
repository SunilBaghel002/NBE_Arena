"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { InstructionsSkeleton } from "@/components/ui/InstructionsSkeleton";
import {
  ShieldCheck,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  CheckSquare,
  Square,
  FileText,
  MousePointer,
  RotateCcw,
  Zap,
  Layers,
  AlertCircle,
  Monitor,
} from "lucide-react";
import { HydratedMockTest } from "@/types";

export default function InstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const mockId = params.mockId as string;

  const [mock, setMock] = useState<HydratedMockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "general" | "nav" | "marking">("all");

  useEffect(() => {
    async function loadMockSummary() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/mock/${mockId}`);
        if (!res.ok) {
          throw new Error("Failed to load examination specifications");
        }
        const data: HydratedMockTest = await res.json();
        setMock(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading instructions");
      } finally {
        setLoading(false);
      }
    }

    if (mockId) {
      loadMockSummary();
    }
  }, [mockId]);

  const handleBeginTest = () => {
    if (!isAgreed) return;
    router.push(`/test/${mockId}`);
  };

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Top Universal Navbar */}
      <Navbar />

      {loading ? (
        <InstructionsSkeleton />
      ) : error || !mock ? (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-200 text-center max-w-md w-full">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="font-bold text-xl text-slate-900 mb-2">Examination Error</h2>
            <p className="text-sm text-slate-600 mb-6">{error || "Could not retrieve mock test specifications"}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Main Container: Full-width matching Dashboard (max-w-[1700px]) */
        <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex-1 space-y-6 animate-in fade-in duration-150">
          {/* Top Exam Header Banner */}
          <div className="bg-white rounded-3xl shadow-card border border-slate-200/90 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-exam-primary">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>National Board of Examinations in Medical Sciences (NBEMS)</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Official Paper ID: {mock.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Junior Assistant Computer Based Test (CBT) Instructions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-4xl leading-relaxed">
              Please review all examination rules, sectional structures, navigation protocols, and the official +1.00 / −0.25 negative marking policy.
              The <strong>180-minute countdown timer will NOT begin</strong> until you confirm the candidate declaration and click <strong>&quot;Begin Test&quot;</strong>.
            </p>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 block">
                  Total Questions
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-0.5 block">
                  200 Qs
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">4 Sections × 50 MCQs</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 block">
                  Total Duration
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-0.5 block">
                  180 Mins
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Continuous Countdown</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 block">
                  Marking Formula
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-exam-danger mt-0.5 block">
                  −0.25
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">+1.00 for Correct Answer</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 block">
                  Target Benchmark
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-exam-success mt-0.5 block">
                  150+ / 200
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">75% Net Qualifying Score</span>
              </div>
            </div>
          </div>

          {/* 2-Column Core Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ============================================================ */}
            {/* LEFT COLUMN (8 cols): Industry-Grade Instructions & Rules    */}
            {/* ============================================================ */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-card border border-slate-200/90 p-6 sm:p-8 space-y-7">
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === "all"
                      ? "bg-exam-primary text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Guidelines
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === "general"
                      ? "bg-exam-primary text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  General & Auto-Submit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("marking")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === "marking"
                      ? "bg-exam-primary text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Sections & Marking Scheme
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("nav")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === "nav"
                      ? "bg-exam-primary text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Answering Procedure
                </button>
              </div>

              {/* Part 1: General Examination Instructions */}
              {(activeTab === "all" || activeTab === "general") && (
                <section className="space-y-3.5 animate-in fade-in duration-150">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-exam-primary" />
                    <span>1. General Instructions & Auto-Submit Protocol</span>
                  </h3>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <p>
                        <strong>Server Countdown Clock:</strong> The clock will be set at the server. The countdown timer in the top right corner of your screen will display the remaining time available for you to complete the test (180:00 minutes).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-amber-950 font-medium">
                        <strong>Automatic Submission at 00:00:00:</strong> When the timer reaches zero, the examination will <strong>automatically terminate and submit</strong> your recorded answers. You do NOT need to manually click submit if the allotted time runs out.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <p>
                        <strong>Question Palette Navigation:</strong> The Question Palette displayed on the right side of screen will show the status of each question using official color-coded symbols (Answered, Not Answered, Not Visited, Marked for Review).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        4
                      </span>
                      <p>
                        <strong>State Persistence:</strong> In the event of an accidental browser refresh or power glitch, your remaining timer seconds and all saved answers are continuously stored in local storage and will automatically resume upon reloading.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Part 2: Section Distribution & Marking Formula */}
              {(activeTab === "all" || activeTab === "marking") && (
                <section className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-exam-primary" />
                    <span>2. Section Distribution & Official Marking Policy</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    The examination consists of <strong>4 mandatory sections</strong> with 50 multiple choice questions each. You can freely navigate between sections at any time during the 180 minutes.
                  </p>

                  {/* Section Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Section No.</th>
                          <th className="py-3 px-4">Section Subject</th>
                          <th className="py-3 px-4 text-center">Questions</th>
                          <th className="py-3 px-4 text-center">Correct Mark</th>
                          <th className="py-3 px-4 text-center">Negative Mark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        <tr className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-exam-primary font-mono">Section I</td>
                          <td className="py-3 px-4 font-bold">General Intelligence & Reasoning</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">50</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-mono font-bold">+1.00</td>
                          <td className="py-3 px-4 text-center text-rose-600 font-mono font-bold">−0.25</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-exam-primary font-mono">Section II</td>
                          <td className="py-3 px-4 font-bold">General Awareness (Current Affairs, Science, History, GK)</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">50</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-mono font-bold">+1.00</td>
                          <td className="py-3 px-4 text-center text-rose-600 font-mono font-bold">−0.25</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-exam-primary font-mono">Section III</td>
                          <td className="py-3 px-4 font-bold">Quantitative Aptitude (Arithmetic & Basic Algebra)</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">50</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-mono font-bold">+1.00</td>
                          <td className="py-3 px-4 text-center text-rose-600 font-mono font-bold">−0.25</td>
                        </tr>
                        <tr className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-exam-primary font-mono">Section IV</td>
                          <td className="py-3 px-4 font-bold">English Comprehension & Grammar</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">50</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-mono font-bold">+1.00</td>
                          <td className="py-3 px-4 text-center text-rose-600 font-mono font-bold">−0.25</td>
                        </tr>
                        <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-200">
                          <td className="py-3.5 px-4 font-mono" colSpan={2}>
                            Total Examination Structure
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-sm">200 Qs</td>
                          <td className="py-3.5 px-4 text-center font-mono text-sm text-emerald-700">200 Max</td>
                          <td className="py-3.5 px-4 text-center font-mono text-sm text-rose-700">−0.25 Penalty</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Negative Marking Callout Box */}
                  <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                    <span className="font-bold block text-rose-950 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Official Negative Marking Formula:
                    </span>
                    <p className="font-mono text-slate-800">
                      Net Score = (Total Correct Answers × 1.00) − (Total Wrong Answers × 0.25)
                    </p>
                    <p className="text-[11px] text-rose-700">
                      Unanswered / Skipped questions receive 0.00 marks (no penalty deduction).
                    </p>
                  </div>
                </section>
              )}

              {/* Part 3: Navigating & Answering Questions */}
              {(activeTab === "all" || activeTab === "nav") && (
                <section className="space-y-3.5 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-exam-primary" />
                    <span>3. Question Navigation & Answering Procedure</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        To Answer a Question:
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        1. Click on option A, B, C, or D to select your answer choice.
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        2. Click on <strong>&quot;Save & Next&quot;</strong> to save your answer and proceed to the next question.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        To Change or Clear an Answer:
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        1. Click on another option to change your choice, or click <strong>&quot;Clear Response&quot;</strong> to deselect.
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        2. Click <strong>&quot;Mark for Review & Next&quot;</strong> if you wish to review the question before submission.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Part 4: Exam Hall Discipline */}
              {activeTab === "all" && (
                <section className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-slate-700" />
                    <span>4. Examination Hall Security & Recommendations</span>
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Fullscreen mode is recommended for an authentic distraction-free experience.</li>
                    <li>Do not navigate away, minimize, or open other tabs during the live test session.</li>
                    <li>Official answer keys and step-by-step explanations will be unlocked immediately on the Scorecard Review screen after submission.</li>
                  </ul>
                </section>
              )}
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN (4 cols): Sticky Palette Legend & Declaration   */}
            {/* ============================================================ */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
              {/* Question Palette Color Legend Guide (TCS iON / SSC Standard) */}
              <div className="bg-white rounded-3xl shadow-card border border-slate-200/90 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-exam-primary" />
                    <span>Question Palette Status Guide</span>
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400">5 States</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* 1. Answered */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-7 h-7 rounded-lg bg-exam-answered text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Green — Answered</span>
                      <span className="text-[11px] text-emerald-700 font-medium">Evaluated for final score</span>
                    </div>
                  </div>

                  {/* 2. Not Answered */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-7 h-7 rounded-lg bg-exam-unanswered text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Red — Not Answered</span>
                      <span className="text-[11px] text-slate-500 font-medium">Visited but answer not saved</span>
                    </div>
                  </div>

                  {/* 3. Not Visited */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Grey — Not Visited</span>
                      <span className="text-[11px] text-slate-500 font-medium">Question not yet opened</span>
                    </div>
                  </div>

                  {/* 4. Marked for Review */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-7 h-7 rounded-lg bg-exam-marked text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                      4
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Purple — Marked for Review</span>
                      <span className="text-[11px] text-purple-700 font-medium">Unanswered, marked for review</span>
                    </div>
                  </div>

                  {/* 5. Answered & Marked for Review */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="w-7 h-7 rounded-lg bg-exam-markedAnswered text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0 relative">
                      5
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">Purple + Dot — Answered & Marked</span>
                      <span className="text-[11px] text-emerald-700 font-medium">Will be evaluated for final score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Declaration & Launcher Console */}
              <div className="bg-white rounded-3xl shadow-card border border-slate-200/90 p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-eyebrow block mb-1">Pre-Exam Check</span>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Candidate Declaration</span>
                  </h3>
                </div>

                {/* Disclaimer Checkbox */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 text-xs text-slate-900 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded-md text-exam-primary focus:ring-exam-primary cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-bold leading-relaxed text-slate-900">
                      I have read, understood, and agreed to all rules, time limits (180 minutes), section distributions (200 questions), and negative marking (−0.25) of the NBEMS Junior Assistant Examination. I declare that I am ready to begin.
                    </span>
                  </label>
                </div>

                {/* Begin Test CTA Button */}
                <button
                  type="button"
                  onClick={handleBeginTest}
                  disabled={!isAgreed}
                  className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-md transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isAgreed
                      ? "bg-exam-success hover:bg-emerald-700 shadow-emerald-500/25 animate-pulse"
                      : "bg-slate-400"
                  }`}
                >
                  <span>Begin Test (Start 180-Min Timer)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/dashboard"
                  className="w-full text-center block text-xs font-bold text-slate-500 hover:text-slate-800 py-2 transition"
                >
                  Cancel & Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — Official NBEMS Junior Assistant Examination Simulation · Standardized +1.00 / −0.25 CBT Engine
      </footer>
    </div>
  );
}
