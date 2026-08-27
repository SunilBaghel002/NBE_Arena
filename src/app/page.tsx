"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  History,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react";
import { BankStats, MockTest, Attempt } from "@/types";

export default function LobbyPage() {
  const router = useRouter();
  const [bankStats, setBankStats] = useState<BankStats | null>(null);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<(Attempt & { mockTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch bank stats, mocks, and past attempts
  useEffect(() => {
    async function loadLobbyData() {
      try {
        setLoading(true);
        const [statsRes, mocksRes, attemptsRes] = await Promise.all([
          fetch("/api/bank-stats"),
          fetch("/api/mocks"),
          fetch("/api/attempts"),
        ]);

        if (statsRes.ok) {
          const stats = await statsRes.json();
          setBankStats(stats);
        }

        if (mocksRes.ok) {
          const mData = await mocksRes.json();
          setMocks(mData.mocks || []);
        }

        if (attemptsRes.ok) {
          const aData = await attemptsRes.json();
          setAttempts(aData.attempts || []);
        }
      } catch (err) {
        console.error("Error loading lobby data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLobbyData();
  }, []);

  const canGenerateMock = Boolean(
    bankStats &&
      bankStats.activeBySection.REASONING >= 50 &&
      bankStats.activeBySection.GA >= 50 &&
      bankStats.activeBySection.QUANT >= 50 &&
      bankStats.activeBySection.ENGLISH >= 50
  );

  const handleGenerateMock = async () => {
    try {
      setGenerating(true);
      setErrorMsg(null);
      const res = await fetch("/api/generate-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate mock");
      }

      const data = await res.json();
      router.push(`/test/${data.mockId}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error generating mock test");
      setGenerating(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <main className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Top CBT Portal Header */}
      <header className="bg-exam-primary text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-exam-saffron rounded flex items-center justify-center font-black text-white text-lg tracking-wider shadow">
              NBE
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">NBE ARENA</h1>
              <p className="text-xs text-white/80">NBEMS Junior Assistant CBT Platform</p>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-2 rounded-lg transition border border-white/20 flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Admin & Question Bank</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-md border border-exam-border p-6 sm:p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-exam-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-exam-primary" /> Official CBT Pattern Simulation
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-exam-text tracking-tight mb-2">
            NBE Junior Assistant Full-Length Mock Test
          </h2>
          <p className="text-sm sm:text-base text-exam-muted max-w-2xl mx-auto mb-8 font-medium">
            200 Questions · 180 Minutes (3 Hours) · 4 Sections × 50 · +1 Correct, -0.25 Negative Marking
          </p>

          {/* Exam Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto mb-8 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-exam-primary mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase text-slate-500">Total Questions</span>
              </div>
              <p className="text-xl font-black text-slate-900">200 Qs</p>
              <p className="text-[11px] text-slate-500 mt-0.5">50 × 4 Sections</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-exam-saffron mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase text-slate-500">Duration</span>
              </div>
              <p className="text-xl font-black text-slate-900">180 Min</p>
              <p className="text-[11px] text-slate-500 mt-0.5">3.0 Hours continuous</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-exam-danger mb-1">
                <span className="font-black text-sm">±</span>
                <span className="text-[11px] font-bold uppercase text-slate-500">Negative Penalty</span>
              </div>
              <p className="text-xl font-black text-exam-danger">-0.25</p>
              <p className="text-[11px] text-slate-500 mt-0.5">+1.00 for Correct</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-exam-success mb-1">
                <Award className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase text-slate-500">Target Score</span>
              </div>
              <p className="text-xl font-black text-exam-success">150 / 200</p>
              <p className="text-[11px] text-slate-500 mt-0.5">75% Net Benchmark</p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="max-w-md mx-auto mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerateMock}
              disabled={generating || !canGenerateMock}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-base px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Assembling 200 Questions...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Generate New Mock Test</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {!canGenerateMock && bankStats && (
            <p className="text-xs text-rose-600 font-semibold mt-3">
              ⚠️ Need at least 50 questions in each section to generate a mock test.
            </p>
          )}
        </div>

        {/* Question Bank Status Bar */}
        {bankStats && (
          <div className="bg-white rounded-xl shadow-sm border border-exam-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-exam-primary" /> Question Repository Pool
              </h3>
              <span className="text-xs font-semibold text-slate-600">
                Total Available: <strong>{bankStats.total} Questions</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block">Reasoning</span>
                <span className="text-lg font-black text-exam-primary">
                  {bankStats.activeBySection.REASONING} / 50
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block">General Awareness</span>
                <span className="text-lg font-black text-exam-primary">
                  {bankStats.activeBySection.GA} / 50
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block">Quant Aptitude</span>
                <span className="text-lg font-black text-exam-primary">
                  {bankStats.activeBySection.QUANT} / 50
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block">English</span>
                <span className="text-lg font-black text-exam-primary">
                  {bankStats.activeBySection.ENGLISH} / 50
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Previous Attempts & Available Mocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Attempts */}
          <div className="bg-white rounded-xl shadow-sm border border-exam-border p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-exam-primary" /> Recent Test Attempts
                </h3>
                <span className="text-xs text-slate-500 font-semibold">{attempts.length} attempts</span>
              </div>

              {attempts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No attempts recorded yet. Click &quot;Generate New Mock Test&quot; to start your first session.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {attempts.map((att) => {
                    const score = att.score;
                    if (!score) return null;

                    return (
                      <div
                        key={att.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-800 truncate max-w-[180px]">
                            {att.mockTitle || "NBE Full Mock"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(att.submittedAt || att.startedAt).toLocaleDateString()} · Time:{" "}
                            {formatSeconds(att.timeTakenSeconds)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-base font-black text-slate-900 block leading-tight">
                              {score.netScore} / 200
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                score.qualifyingCleared
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {score.qualifyingCleared ? "QUALIFIED" : "BELOW TARGET"}
                            </span>
                          </div>

                          <Link
                            href={`/results/${att.id}`}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="View Scorecard"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Generated Mocks Ready to Attempt */}
          <div className="bg-white rounded-xl shadow-sm border border-exam-border p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-exam-primary" /> Generated Mock Papers
                </h3>
                <span className="text-xs text-slate-500 font-semibold">{mocks.length} papers</span>
              </div>

              {mocks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No mock papers generated yet. Click &quot;Generate New Mock Test&quot; above to create one.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {mocks.map((mock, idx) => (
                    <div
                      key={mock.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-800">{mock.title}</p>
                        <p className="text-[10px] text-slate-500">
                          200 Questions · 180 Minutes · Created {new Date(mock.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Link
                        href={`/test/${mock.id}`}
                        className="flex items-center gap-1 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-exam-muted">
        NBE Arena — National Board of Examinations in Medical Sciences CBT Mock Platform
      </footer>
    </main>
  );
}
