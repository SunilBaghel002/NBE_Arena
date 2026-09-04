"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Brain,
  Calculator,
  AlertTriangle,
  Clock,
  RotateCcw,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  ShieldAlert,
  CalendarCheck,
  ArrowRight,
  Flame,
} from "lucide-react";
import { MultiMockAIAnalysis } from "@/types";

interface MultiMockReportCardProps {
  candidateName: string;
  totalAttempts: number;
}

export function MultiMockReportCard({ candidateName, totalAttempts }: MultiMockReportCardProps) {
  const [report, setReport] = useState<MultiMockAIAnalysis | null>(null);
  const [checkingCache, setCheckingCache] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if report already exists in MongoDB Atlas (ZERO TOKENS on GET)
  useEffect(() => {
    async function checkSavedReport() {
      if (totalAttempts < 1) {
        setCheckingCache(false);
        return;
      }

      try {
        setCheckingCache(true);
        const res = await fetch("/api/analytics/ai-report");
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setReport(data.report);
          }
        }
      } catch (err) {
        console.error("Error checking saved multi-mock report:", err);
      } finally {
        setCheckingCache(false);
      }
    }

    checkSavedReport();
  }, [totalAttempts]);

  // Explicit button click triggers POST and generates fresh report
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);

      const res = await fetch("/api/analytics/ai-report", {
        method: "POST",
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to generate multi-mock report");
      }

      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating multi-mock report");
    } finally {
      setGenerating(false);
    }
  };

  if (totalAttempts < 1) {
    return null;
  }

  if (checkingCache) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
        <span className="text-xs text-slate-400">Checking saved performance analytics...</span>
      </div>
    );
  }

  // Not yet generated: Show on-demand callout with button (ZERO AUTOMATIC TOKEN USAGE)
  if (!report) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-700/60 p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> {totalAttempts} Mock Sessions Analyzed
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Generate Multi-Mock Strategic Audit for {candidateName}
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Diagnose recurring score plateaus, chronic error patterns in Mathematics & Reasoning, and receive a customized 10-day countdown master plan for the September 15th NBEMS exam.
          </p>
          {error && <p className="text-xs text-rose-300 font-semibold">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex-shrink-0 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing 5 Mocks...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Multi-Mock Report</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 shadow-md overflow-hidden animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-300" /> AI Master Diagnostic
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Saved in Database · Studied {report.totalMocksAnalyzed} Full Mocks · {report.provider}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Longitudinal Performance Audit & Master Recovery Blueprint
          </h2>
          <p className="text-xs text-indigo-200/90 mt-0.5">
            Comparative analysis of {candidateName}&apos;s recurring mistakes in Reasoning & Math to bridge the gap to 150/200.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-50"
            title="Refresh analysis"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Analyzing..." : "Regenerate"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-7 space-y-6">
          {/* Executive Trajectory Summary */}
          <div className="bg-indigo-50/70 rounded-xl p-4 sm:p-5 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Score Trajectory & Plateau Assessment
              </span>
              <span className="text-xs font-black text-indigo-800 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-md">
                10 Days to Exam (Sept 15)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {report.scoreTrajectorySummary}
            </p>

            {/* Trajectory Progression Pills */}
            <div className="mt-3.5 pt-3 border-t border-indigo-200/60 flex flex-wrap items-center gap-2 font-tabular">
              <span className="text-[11px] font-bold text-indigo-950 uppercase">Attempt History:</span>
              {report.netScoreProgression?.map((prog, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs shadow-2xs"
                >
                  <span className="font-bold text-slate-700">M{i + 1}:</span>
                  <span className="font-black text-indigo-900">{prog.netScore}</span>
                  <span className="text-[10px] text-slate-400">({prog.accuracy}%)</span>
                  {prog.penalty > 0 && (
                    <span className="text-[10px] text-rose-600 font-semibold">-{prog.penalty}p</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practical Exam Hall Mechanics: How It Works For Her */}
          {report.howItWorksForYou && report.howItWorksForYou.length > 0 && (
            <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-600" /> How It Works For You: Practical Real-Time Execution Rules
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specific rules to execute in the 180-minute countdown to prevent cognitive exhaustion and stop losing marks.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  Game-Changer Rules
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.howItWorksForYou.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black uppercase text-indigo-900">
                          {item.section}
                        </span>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {item.expectedMarkJump}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 mb-2 leading-snug">{item.title}</h4>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-950">
                          <strong className="block text-[10px] uppercase tracking-wide text-rose-800 mb-0.5">
                            Why You Make This Mistake:
                          </strong>
                          <span className="leading-relaxed">{item.mistakeBreakdown}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-950">
                          <strong className="block text-[10px] uppercase tracking-wide text-emerald-800 mb-0.5">
                            How It Will Work In Real-Time:
                          </strong>
                          <span className="leading-relaxed">{item.realTimeExecutionRule}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10-Day Exam Countdown & Mock Strategy Schedule */}
          {report.examCountdownSchedule && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-700/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-300" />
                  <div>
                    <h3 className="font-black text-sm text-white">
                      10-Day Exam Countdown Strategy (D-Day: {report.examCountdownSchedule.examDate})
                    </h3>
                    <p className="text-[11px] text-indigo-200">
                      Mock in 3 days (Sept 8) + 3 consecutive mocks on Sept 12, 13, 14.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg">
                  {report.examCountdownSchedule.daysRemaining} Days Left
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {report.examCountdownSchedule.milestones?.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                      m.isMockDay
                        ? "bg-indigo-800/40 border-indigo-400/50"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-indigo-200">
                          {m.date}
                        </span>
                        {m.isMockDay && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                            MOCK DAY
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1 leading-snug">{m.title}</h4>
                      <p className="text-[11px] text-indigo-200/80 leading-relaxed">{m.objective}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deep Dives: Reasoning & Mathematics (Quant) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reasoning Deep Dive */}
            <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-sm text-slate-900">Reasoning Diagnostic</h3>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded">
                  Target: 42+ Net Marks
                </span>
              </div>
              <p className="text-xs font-semibold text-purple-900 bg-purple-50/70 p-2.5 rounded-lg border border-purple-100">
                Status: {report.reasoningDeepDive?.status}
              </p>

              <div>
                <span className="text-[11px] font-black uppercase text-rose-700 block mb-1">
                  Observed Recurring Errors:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {report.reasoningDeepDive?.observedErrors?.map((errItem, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">✗</span>
                      <span>{errItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-purple-100">
                <span className="text-[11px] font-black uppercase text-emerald-700 block mb-1">
                  Step-by-Step Recovery:
                </span>
                <ul className="space-y-1 text-xs text-slate-800 font-medium">
                  {report.reasoningDeepDive?.stepByStepImprovement?.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mathematics / Quant Deep Dive */}
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-sm text-slate-900">Mathematics (Quant) Diagnostic</h3>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded">
                  Target: 38+ Net Marks
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-900 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                Status: {report.mathematicsDeepDive?.status}
              </p>

              <div>
                <span className="text-[11px] font-black uppercase text-rose-700 block mb-1">
                  Observed Bottlenecks & Mistakes:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {report.mathematicsDeepDive?.observedErrors?.map((errItem, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">✗</span>
                      <span>{errItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-blue-100">
                <span className="text-[11px] font-black uppercase text-emerald-700 block mb-1">
                  Step-by-Step Remedial Strategy:
                </span>
                <ul className="space-y-1 text-xs text-slate-800 font-medium">
                  {report.mathematicsDeepDive?.stepByStepImprovement?.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Chronic Sectional Weaknesses Table */}
          {report.chronicWeaknesses?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mb-3">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Chronic Weaknesses Across Mock Sessions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.chronicWeaknesses.map((item, idx) => {
                  let badge = "bg-amber-100 text-amber-800";
                  if (item.severity === "CRITICAL") badge = "bg-rose-100 text-rose-800 border-rose-200";
                  else if (item.severity === "HIGH") badge = "bg-orange-100 text-orange-800";

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-slate-800">
                            {item.section}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge}`}>
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mb-2 leading-snug">{item.pattern}</p>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/70">
                        <strong className="text-indigo-900">Fix:</strong> {item.remedy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Allocation Critique & Blueprint */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-amber-600" /> Exam Hall Time Allocation Critique
            </h3>
            <p className="text-xs text-amber-900 font-medium mb-3 leading-relaxed">
              <strong className="text-amber-950">Detected Imbalance:</strong>{" "}
              {report.timeAllocationCritique?.detectedImbalance}
            </p>
            <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-800">
              <span className="text-indigo-700 uppercase block text-[10px] mb-0.5">
                Recommended 180-Minute Blueprint:
              </span>
              <span>{report.timeAllocationCritique?.idealStrategy}</span>
            </div>
          </div>

          {/* Personalized Master Plan */}
          {report.personalizedMasterPlan?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mb-3.5">
                <Award className="w-4 h-4 text-indigo-600" /> Personalized Master Plan to Reach 150+ Marks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.personalizedMasterPlan.map((plan, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-black uppercase text-indigo-700 block">
                      {plan.weekOrDay}
                    </span>
                    <p className="text-xs font-black text-slate-900 leading-snug">{plan.goal}</p>
                    <ul className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px] text-slate-700 font-medium">
                      {plan.dailyActionItems?.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
