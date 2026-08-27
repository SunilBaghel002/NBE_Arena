"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Loader2,
  FileText,
  HelpCircle,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-exam-primary animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-base text-slate-800">Loading Examination Instructions</h2>
          <p className="text-xs text-slate-500 mt-1">Preparing official NBEMS guidelines...</p>
        </div>
      </div>
    );
  }

  if (error || !mock) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
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
    );
  }

  return (
    <main className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* CBT Top Header */}
      <header className="bg-exam-primary text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-exam-saffron rounded flex items-center justify-center font-black text-white text-sm">
              NBE
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg">Pre-Examination Instructions</h1>
              <p className="text-xs text-white/80">{mock.title}</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Instructions Body */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Exam Structure Hero Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-exam-primary mb-3">
            <ShieldCheck className="w-4 h-4" /> National Board of Examinations in Medical Sciences
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Junior Assistant CBT Examination Instructions
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Please read the following instructions carefully before commencing the test. The 180-minute timer will start only when you click <strong>&quot;Begin Test&quot;</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Questions</span>
              <span className="text-2xl font-black text-slate-900">200 Qs</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">50 × 4 Sections</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Duration</span>
              <span className="text-2xl font-black text-slate-900">180 Mins</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">3.0 Hours Continuous</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">Marking Scheme</span>
              <span className="text-2xl font-black text-exam-danger">-0.25</span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">+1.00 for Correct</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">Qualifying Target</span>
              <span className="text-2xl font-black text-exam-success">150 / 200</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">75% Net Benchmark</span>
            </div>
          </div>

          {/* Section Distribution Table */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-exam-primary" /> Section Distribution & Syllabus Focus
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
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-exam-primary">Section I</td>
                    <td className="p-3 font-semibold text-slate-800">General Intelligence & Reasoning</td>
                    <td className="p-3 text-center font-bold">50</td>
                    <td className="p-3 text-center font-bold">50</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-exam-primary">Section II</td>
                    <td className="p-3 font-semibold text-slate-800">General Awareness (Polity, History, Science, GK)</td>
                    <td className="p-3 text-center font-bold">50</td>
                    <td className="p-3 text-center font-bold">50</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-exam-primary">Section III</td>
                    <td className="p-3 font-semibold text-slate-800">Quantitative Aptitude (Arithmetic & Basic Algebra)</td>
                    <td className="p-3 text-center font-bold">50</td>
                    <td className="p-3 text-center font-bold">50</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-exam-primary">Section IV</td>
                    <td className="p-3 font-semibold text-slate-800">English Comprehension & Grammar</td>
                    <td className="p-3 text-center font-bold">50</td>
                    <td className="p-3 text-center font-bold">50</td>
                  </tr>
                  <tr className="bg-slate-50/80 font-black text-slate-900">
                    <td className="p-3" colSpan={2}>Total Paper</td>
                    <td className="p-3 text-center text-sm">200 Questions</td>
                    <td className="p-3 text-center text-sm">200 Marks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CBT Question Palette Color Legend Instructions */}
          <div className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-exam-primary" /> Question Palette Status Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-exam-answered text-white font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span><strong>Green:</strong> You have answered the question.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-exam-unanswered text-white font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span><strong>Red:</strong> Visited but not yet answered.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-exam-marked text-white font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span><strong>Purple:</strong> Marked for review without answer.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                  4
                </span>
                <span><strong>Grey:</strong> You have not visited the question yet.</span>
              </div>
            </div>
          </div>

          {/* Mandatory Declaration Checkbox */}
          <div className="p-5 rounded-xl bg-blue-50/70 border-2 border-blue-200">
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-exam-primary focus:ring-exam-primary cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                I have read, understood, and agreed to all the rules, time limit (180 minutes), section distribution (200 questions), and negative marking scheme (+1.00 / -0.25) of the NBEMS Junior Assistant Examination. I declare that I am ready to begin.
              </span>
            </label>
          </div>

          {/* Begin Test CTA Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
            >
              Cancel & Return to Dashboard
            </Link>

            <button
              type="button"
              onClick={handleBeginTest}
              disabled={!isAgreed}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-exam-success hover:bg-emerald-700 text-white font-black text-base px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-exam-success"
            >
              <span>Begin Test (Start 180-Min Timer)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — Official NBEMS Junior Assistant Examination Simulation
      </footer>
    </main>
  );
}
