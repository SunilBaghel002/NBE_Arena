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
  CheckSquare,
  Square,
  FileText,
  HelpCircle,
  Sparkles,
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
      {/* Universal Top Navbar */}
      <Navbar />

      {loading ? (
        <InstructionsSkeleton />
      ) : error || !mock ? (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-md w-full">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="font-bold text-xl text-slate-800 mb-2">Examination Error</h2>
            <p className="text-sm text-slate-600 mb-6">{error || "Could not retrieve mock test"}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Main Instructions Body */
        <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6 animate-in fade-in duration-150">
          {/* Exam Structure Hero Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-exam-primary mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> National Board of Examinations in Medical Sciences
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Junior Assistant CBT Examination Rules
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Please read the instructions carefully before commencing the test. The 180-minute countdown timer will commence only after you review the instructions, check the declaration box, and click <strong>&quot;Begin Test&quot;</strong>.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Questions</span>
                <span className="text-2xl font-black text-slate-900">200 Qs</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">50 × 4 Sections</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Duration</span>
                <span className="text-2xl font-black text-slate-900">180 Mins</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">3.0 Hours Continuous</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Marking Scheme</span>
                <span className="text-2xl font-black text-exam-danger">-0.25</span>
                <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">+1.00 for Correct</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Qualifying Target</span>
                <span className="text-2xl font-black text-exam-success">150 / 200</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">75% Net Benchmark</span>
              </div>
            </div>

            {/* Section Distribution Table */}
            <div className="mb-6">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-exam-primary" /> Section Distribution & Marks Allocation
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-3">Section No.</th>
                      <th className="p-3">Section Title</th>
                      <th className="p-3 text-center">Questions</th>
                      <th className="p-3 text-center">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-exam-primary">Section I</td>
                      <td className="p-3 font-bold">General Intelligence & Reasoning</td>
                      <td className="p-3 text-center font-bold">50</td>
                      <td className="p-3 text-center font-bold">50</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-exam-primary">Section II</td>
                      <td className="p-3 font-bold">General Awareness (History, Polity, Science, GK)</td>
                      <td className="p-3 text-center font-bold">50</td>
                      <td className="p-3 text-center font-bold">50</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-exam-primary">Section III</td>
                      <td className="p-3 font-bold">Quantitative Aptitude (Arithmetic & Basic Algebra)</td>
                      <td className="p-3 text-center font-bold">50</td>
                      <td className="p-3 text-center font-bold">50</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-exam-primary">Section IV</td>
                      <td className="p-3 font-bold">English Comprehension & Grammar</td>
                      <td className="p-3 text-center font-bold">50</td>
                      <td className="p-3 text-center font-bold">50</td>
                    </tr>
                    <tr className="bg-slate-50/90 font-black text-slate-900">
                      <td className="p-3" colSpan={2}>Total Paper</td>
                      <td className="p-3 text-center text-sm font-black">200 Questions</td>
                      <td className="p-3 text-center text-sm font-black">200 Marks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CBT Question Palette Color Legend Guide */}
            <div className="mb-8 p-5 bg-slate-50/80 rounded-xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-exam-primary" /> Question Palette Status Guide
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-exam-answered text-white font-black flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span><strong>Green:</strong> You have answered the question.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-exam-unanswered text-white font-black flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span><strong>Red:</strong> Visited but not yet answered.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-exam-marked text-white font-black flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span><strong>Purple:</strong> Marked for review without answering.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-black flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span><strong>Grey:</strong> You have not visited the question yet.</span>
                </div>
              </div>
            </div>

            {/* Mandatory Declaration Checkbox */}
            <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 shadow-xs">
              <label className="flex items-start space-x-3.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded-md text-exam-primary focus:ring-exam-primary cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
                  I have read, understood, and agreed to all the rules, time limit (180 minutes), section distribution (200 questions), and negative marking scheme (+1.00 / −0.25) of the NBEMS Junior Assistant Examination. I declare that I am ready to begin.
                </span>
              </label>
            </div>

            {/* Begin Test CTA Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/"
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
              >
                Cancel & Return to Dashboard
              </Link>

              <button
                type="button"
                onClick={handleBeginTest}
                disabled={!isAgreed}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-black text-base px-8 py-3.5 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isAgreed
                    ? "bg-exam-success hover:bg-emerald-700 shadow-emerald-500/20"
                    : "bg-slate-400"
                }`}
              >
                <span>Begin Test (Start 180-Min Timer)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — Official NBEMS Junior Assistant Examination Simulation
      </footer>
    </div>
  );
}
