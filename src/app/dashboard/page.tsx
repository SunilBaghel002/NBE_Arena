"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import {
  PlusCircle,
  Play,
  UserCheck,
  Search,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  Brain,
} from "lucide-react";
import { BankStats, MockTest, Attempt } from "@/types";
import { computeKpiMetrics } from "@/lib/analytics-helpers";

// Dashboard Modules (A through K)
import { EnhancedKpiRow } from "@/components/dashboard/EnhancedKpiRow";
import { ScoreTrajectoryChart } from "@/components/dashboard/ScoreTrajectoryChart";
import { SectionalMasteryCharts } from "@/components/dashboard/SectionalMasteryCharts";
import { StrengthWeaknessPanel } from "@/components/dashboard/StrengthWeaknessPanel";
import { TimeAnalyticsChart } from "@/components/dashboard/TimeAnalyticsChart";
import { NegativeMarkingLeakageCard } from "@/components/dashboard/NegativeMarkingLeakageCard";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { ImprovementTrendBadge } from "@/components/dashboard/ImprovementTrendBadge";
import { CountdownGoalWidget } from "@/components/dashboard/CountdownGoalWidget";
import { RecentAttemptsTable } from "@/components/dashboard/RecentAttemptsTable";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { MultiMockReportModal } from "@/components/dashboard/MultiMockReportModal";

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // Filtered Mocks
  const filteredMocks = useMemo(() => {
    return mocks.filter((m) =>
      m.title.toLowerCase().includes(mockSearch.toLowerCase())
    );
  }, [mocks, mockSearch]);

  // Calculate Metrics
  const kpiMetrics = useMemo(() => {
    return computeKpiMetrics(attempts);
  }, [attempts]);

  const attemptDates = useMemo(() => {
    return attempts
      .map((a) => {
        try {
          const rawDate = a.submittedAt || a.startedAt;
          return rawDate ? new Date(rawDate).toISOString().split("T")[0] : "";
        } catch {
          return "";
        }
      })
      .filter(Boolean);
  }, [attempts]);

  const userName = session?.user?.name || "Candidate";
  const userRole = (session?.user as any)?.role || "student";
  const totalCompleted = kpiMetrics.totalCompleted;

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Top Universal Navbar matching Landing Page */}
      <Navbar />

      {/* Main Container */}
      {status === "loading" || loading ? (
        <DashboardSkeleton />
      ) : (
        <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex-1 space-y-8 animate-in fade-in duration-200">
          {/* Top Hero & Goal Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Welcome Banner & Primary Exam Action Controls */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-shadow duration-200 border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-exam-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                    <UserCheck className="w-3.5 h-3.5" /> Candidate Portal · {userName}
                  </div>

                  {/* Module H: Improvement Trend Badge */}
                  <ImprovementTrendBadge attempts={attempts} />

                  <span className="text-[11px] font-semibold text-slate-500 uppercase px-2.5 py-1 bg-slate-100 rounded-full">
                    Role: {userRole}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  NBEMS Junior Assistant Examination Series
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  200 Questions · 180 Minutes Continuous Countdown · 4 Sections × 50 · Marking: +1.00 Correct, −0.25 Wrong
                </p>
              </div>

              {/* Action Bar: Generate Mock Button on the Right */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Practice Goal:</span> Maintain{" "}
                  <strong className="text-emerald-700 font-bold">150+ / 200 Net Marks</strong> (75% qualifying benchmark)
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Primary Mock Generator Button */}
                  <button
                    type="button"
                    onClick={handleGenerateMock}
                    disabled={generating || !canGenerateMock}
                    className="inline-flex items-center justify-center gap-2 bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Mock...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Generate New Mock</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right 1 Col: Module I Countdown / Goal Setting Widget + AI Strategic Audit Trigger */}
            <div className="flex flex-col gap-3.5">
              <CountdownGoalWidget
                averageScore={kpiMetrics.averageScore}
                attemptDates={attemptDates}
              />

              {/* AI Strategic Audit Trigger Placed Directly Below Exam Countdown */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                disabled={totalCompleted === 0}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition transform active:scale-[0.99] disabled:opacity-40 border border-blue-400/20 group"
                title={
                  totalCompleted === 0
                    ? "Complete at least 1 mock test to unlock longitudinal AI audit"
                    : "Open AI Multi-Mock Strategic Audit"
                }
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black tracking-tight text-white">
                        AI Strategic Audit
                      </span>
                      {totalCompleted > 0 && (
                        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                          {totalCompleted} Mocks
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-100/80 font-medium">
                      Multi-mock diagnostic, score leaks & recovery sprint
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Module A: Enhanced KPI Summary Row */}
          <EnhancedKpiRow metrics={kpiMetrics} />

          {/* Conditional Display: Empty State vs 11 Analytics Modules */}
          {totalCompleted === 0 ? (
            /* Empty State for Fresh Candidates */
            <DashboardEmptyState
              userName={userName}
              onStartFirstMock={handleGenerateMock}
              isGenerating={generating}
            />
          ) : (
            /* Active Analytics Grid for Candidates with Completed Mocks */
            <>
              {/* Row 1: Module B (Score Trajectory) + Module C (GitHub 4-Pillar Sectional Mastery) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScoreTrajectoryChart attempts={attempts} />
                <SectionalMasteryCharts attempts={attempts} />
              </div>

              {/* Row 2: Module D (Strength & Weakness) + Module E (Time Analytics) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StrengthWeaknessPanel attempts={attempts} />
                <TimeAnalyticsChart attempts={attempts} />
              </div>

              {/* Row 3: Module F (Negative Marking Leakage) + Module G (Official NBEMS Syllabus Heatmap) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NegativeMarkingLeakageCard attempts={attempts} />
                <TopicHeatmap attempts={attempts} />
              </div>
            </>
          )}

          {/* Row 4: Available Mock Papers + Module K (Recent Attempts Table) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Mock Papers Card */}
            <div className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-shadow duration-200 border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <span className="text-eyebrow block mb-1">Exam Hall Inventory</span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Play className="w-4 h-4 text-exam-primary" />
                      <span>Available Full-Length Mock Papers</span>
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-3 py-1 rounded-full shadow-xs">
                    {mocks.length} {mocks.length === 1 ? "Paper" : "Papers"}
                  </span>
                </div>

                {mocks.length > 4 && (
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={mockSearch}
                      onChange={(e) => setMockSearch(e.target.value)}
                      placeholder="Filter mock tests..."
                      className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-exam-primary font-medium"
                    />
                  </div>
                )}

                {filteredMocks.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No mock papers found. Click &quot;Generate New Mock&quot; above to create one.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {filteredMocks.map((mock) => (
                      <div
                        key={mock.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 group-hover:text-exam-primary transition">
                            {mock.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            200 Questions · 180 Minutes · 4 Sections × 50
                          </p>
                        </div>

                        <Link
                          href={`/test/${mock.id}/instructions`}
                          className="flex items-center gap-1.5 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition transform active:scale-95 shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Mock</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Mandatory pre-exam rules screen on start</span>
                <span>Auto-save enabled</span>
              </div>
            </div>

            {/* Module K: Recent Attempts Table */}
            <RecentAttemptsTable attempts={attempts} />
          </div>
        </main>
      )}

      {/* Module J: AI Multi-Mock Strategic Audit Modal */}
      <MultiMockReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        candidateName={userName}
        totalAttempts={totalCompleted}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        NBE Arena — National Board of Examinations in Medical Sciences CBT Simulation Platform · Standardized +1.00 / −0.25 Marking Scheme
      </footer>
    </div>
  );
}
