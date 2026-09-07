"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
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
  UserCheck,
  TrendingUp,
  Target,
  FileCheck,
  BarChart2,
  Sparkles,
  Zap,
  Search,
} from "lucide-react";
import { MultiMockReportCard } from "@/components/MultiMockReportCard";
import { BankStats, MockTest, Attempt, SectionType } from "@/types";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [bankStats, setBankStats] = useState<BankStats | null>(null);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<(Attempt & { mockTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mockSearch, setMockSearch] = useState("");

  // If unauthenticated, redirect to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load Dashboard Data
  useEffect(() => {
    async function loadDashboardData() {
      if (status !== "authenticated") return;
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
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [status]);

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
      // Routes to mandatory Pre-Exam Instructions page
      router.push(`/test/${data.mockId}/instructions`);
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

  // Calculate Candidate Performance Summary
  const attemptsWithScores = attempts.filter((a) => a.score);
  const totalCompleted = attemptsWithScores.length;

  const averageScore =
    totalCompleted > 0
      ? Number(
          (
            attemptsWithScores.reduce((acc, curr) => acc + (curr.score?.netScore || 0), 0) /
            totalCompleted
          ).toFixed(2)
        )
      : 0;

  const highestScore =
    totalCompleted > 0
      ? Math.max(...attemptsWithScores.map((a) => a.score?.netScore || 0))
      : 0;

  const averageAccuracy =
    totalCompleted > 0
      ? Number(
          (
            attemptsWithScores.reduce(
              (acc, curr) => acc + (curr.score?.accuracyPercentage || 0),
              0
            ) / totalCompleted
          ).toFixed(1)
        )
      : 0;

  // Section historical accuracy averages
  const sectionAverages: Record<SectionType, { avgNet: number; accuracy: number }> = {
    REASONING: { avgNet: 0, accuracy: 0 },
    GA: { avgNet: 0, accuracy: 0 },
    QUANT: { avgNet: 0, accuracy: 0 },
    ENGLISH: { avgNet: 0, accuracy: 0 },
  };

  if (totalCompleted > 0) {
    for (const secKey of ["REASONING", "GA", "QUANT", "ENGLISH"] as SectionType[]) {
      let sumNet = 0;
      let sumAcc = 0;
      for (const a of attemptsWithScores) {
        const s = a.score?.bySection?.[secKey];
        if (s) {
          sumNet += s.netScore || 0;
          sumAcc += s.accuracyPercentage || 0;
        }
      }
      sectionAverages[secKey] = {
        avgNet: Number((sumNet / totalCompleted).toFixed(1)),
        accuracy: Number((sumAcc / totalCompleted).toFixed(1)),
      };
    }
  }

  // Filtered Mocks
  const filteredMocks = mocks.filter((m) =>
    m.title.toLowerCase().includes(mockSearch.toLowerCase())
  );

  const userName = session?.user?.name || "Candidate";

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Top Universal Navbar */}
      <Navbar />

      {/* Main Container */}
      {status === "loading" || loading ? (
        <DashboardSkeleton />
      ) : (
        <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 flex-1 space-y-8 animate-in fade-in duration-200">
          {/* Welcome & Exam Hero Banner */}
          <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-exam-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
                  <UserCheck className="w-3.5 h-3.5" /> Candidate Portal · {userName}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  NBE Junior Assistant Examination Series
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  200 Questions · 180 Minutes · 4 Sections × 50 · Marking: +1.00 Correct, −0.25 Wrong
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleGenerateMock}
                disabled={generating || !canGenerateMock}
                className="inline-flex items-center justify-center gap-2 bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Mock...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Generate New Mock Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Candidate Performance Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Tests Completed</span>
                <span className="text-2xl font-black text-slate-900">{totalCompleted}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Attempted sessions</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Average Net Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-exam-primary">{averageScore}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 200</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">Target: 150 Qualifying</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Highest Net Score</span>
                <span className="text-2xl font-black text-emerald-700">{highestScore}</span>
                <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">Personal best</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Average Accuracy</span>
                <span className="text-2xl font-black text-slate-900">{averageAccuracy}%</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Correct vs Attempted</span>
              </div>
            </div>
          </div>

          {/* AI Candidate Multi-Mock Diagnostic Report (Studies all completed attempts) */}
          <MultiMockReportCard candidateName={userName} totalAttempts={totalCompleted} />

          {/* Visual Progress & Section Strength Analysis */}
          {totalCompleted > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Trajectory Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-exam-primary" /> Net Score Trajectory
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Target: 150/200
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {attemptsWithScores.slice(0, 5).map((att, idx) => {
                    const s = att.score?.netScore || 0;
                    const pct = Math.min(100, Math.max(0, (s / 200) * 100));
                    const isQual = s >= 150;

                    return (
                      <div key={att.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate max-w-[180px]">{att.mockTitle || `Attempt #${idx + 1}`}</span>
                          <span className="font-bold font-tabular">
                            {s} / 200 marks ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden relative">
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                            style={{ left: "75%" }}
                            title="150 Marks Target Benchmark"
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isQual ? "bg-emerald-500" : "bg-exam-primary"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sectional Strengths */}
              <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-exam-primary" /> Sectional Mastery & Accuracy
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">50 Qs per section</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {(
                    [
                      { key: "REASONING", name: "Reasoning" },
                      { key: "GA", name: "General Awareness" },
                      { key: "QUANT", name: "Quantitative" },
                      { key: "ENGLISH", name: "English" },
                    ] as const
                  ).map((sec) => {
                    const data = sectionAverages[sec.key];
                    return (
                      <div key={sec.key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">{sec.name}</span>
                        <div className="flex items-baseline gap-1 mt-1 font-tabular">
                          <span className="text-xl font-black text-slate-900">{data.avgNet}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/ 50 avg</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                          Accuracy: {data.accuracy}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Available Mock Papers & Personal Attempt History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Mock Papers */}
            <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Play className="w-4 h-4 text-exam-primary" /> Available Mock Papers
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">{mocks.length} papers</span>
                </div>

                {mocks.length > 4 && (
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={mockSearch}
                      onChange={(e) => setMockSearch(e.target.value)}
                      placeholder="Search mock paper..."
                      className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-exam-primary font-medium"
                    />
                  </div>
                )}

                {filteredMocks.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No mock papers found. Click &quot;Generate New Mock Test&quot; above to create one.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {filteredMocks.map((mock) => (
                      <div
                        key={mock.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-800">{mock.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            200 Qs · 180 Mins · 4 Sections × 50
                          </p>
                        </div>

                        <Link
                          href={`/test/${mock.id}/instructions`}
                          className="flex items-center gap-1.5 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Mock</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Personal Attempt History */}
            <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-4 h-4 text-exam-primary" /> Your Attempt History
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">{attempts.length} attempts</span>
                </div>

                {attempts.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    You have not attempted any tests yet. Click &quot;Start Mock&quot; to begin your first practice session.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {attempts.map((att) => {
                      const score = att.score;
                      if (!score) return null;

                      return (
                        <div
                          key={att.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition"
                        >
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-slate-800 truncate max-w-[160px] sm:max-w-[200px]">
                              {att.mockTitle || "NBE Full Mock"}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {new Date(att.submittedAt || att.startedAt).toLocaleDateString()} · Time:{" "}
                              {formatSeconds(att.timeTakenSeconds)} · Accuracy: {score.accuracyPercentage}%
                            </p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="text-base font-black text-slate-900 block leading-tight font-tabular">
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
                              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                              title="View Scorecard & Review"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — National Board of Examinations in Medical Sciences CBT Simulation Platform
      </footer>
    </div>
  );
}
