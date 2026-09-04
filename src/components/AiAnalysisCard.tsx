"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Target,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  Calculator,
  Compass,
  BookOpen,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CalendarCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { DeepAIAnalysis } from "@/types";

interface AiAnalysisCardProps {
  attemptId: string;
  initialAnalysis?: DeepAIAnalysis;
}

export function AiAnalysisCard({ attemptId, initialAnalysis }: AiAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<DeepAIAnalysis | null>(initialAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [checkingCache, setCheckingCache] = useState(!initialAnalysis);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionTab, setActiveSectionTab] = useState<"quant" | "reasoning" | "ga" | "english">("quant");
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if analysis already exists in MongoDB (ZERO TOKENS on GET)
  useEffect(() => {
    async function checkSavedAnalysis() {
      if (initialAnalysis) {
        setCheckingCache(false);
        return;
      }

      try {
        setCheckingCache(true);
        const res = await fetch(`/api/results/${attemptId}/ai-analysis`);
        if (res.ok) {
          const data = await res.json();
          if (data.analysis) {
            setAnalysis(data.analysis);
          }
        }
      } catch (err) {
        console.error("Error checking cached AI analysis:", err);
      } finally {
        setCheckingCache(false);
      }
    }

    checkSavedAnalysis();
  }, [attemptId, initialAnalysis]);

  // Explicit button click triggers POST and generates analysis
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);

      const res = await fetch(`/api/results/${attemptId}/ai-analysis`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate AI analysis");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating AI analysis");
    } finally {
      setGenerating(false);
    }
  };

  if (checkingCache) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
        <span className="text-xs text-slate-400">Loading AI mentor options...</span>
      </div>
    );
  }

  // Not yet generated: Show on-demand callout with button (ZERO AUTOMATIC TOKEN USAGE)
  if (!analysis) {
    return (
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-700/60 p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI Mentor Diagnostic Ready
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Generate Deep AI Performance & Cutoff Recovery Analysis
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Diagnose your score leaks, negative penalty drain (-0.25 blunders), and practical real-time exam mechanics for Math and Reasoning calibrated for the September 15th exam.
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
              <span>Analyzing Responses...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Diagnostic Report</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  const secIcons = {
    reasoning: <Brain className="w-4 h-4 text-purple-600" />,
    quant: <Calculator className="w-4 h-4 text-blue-600" />,
    ga: <Compass className="w-4 h-4 text-amber-600" />,
    english: <BookOpen className="w-4 h-4 text-emerald-600" />,
  };

  const secTitles = {
    reasoning: "Reasoning",
    quant: "Mathematics (Quant)",
    ga: "General Awareness",
    english: "English",
  };

  const currentSec = analysis.sectionWiseAnalysis?.[activeSectionTab];

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 rounded-2xl border border-indigo-200/80 shadow-md overflow-hidden">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-300" /> AI Mentor Diagnostic
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Saved in Database · {analysis.provider} ({analysis.model})
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Strategic Performance & Score-Boost Diagnosis
          </h2>
          <p className="text-xs text-indigo-200/90 mt-0.5">
            Deep examination of your responses, negative score leakage, and recovery roadmap to clear 150/200.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50"
            title="Regenerate diagnostic report"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Updating..." : "Regenerate"}</span>
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
          {/* Executive Summary Card */}
          <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" /> Executive Evaluation & Cutoff Gap
              </h3>
              <span className="text-xs font-black text-indigo-800 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-md">
                10 Days to Sept 15 Exam
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {analysis.executiveSummary}
            </p>

            {/* Score Leak Badges */}
            {analysis.overallScoreDiagnostic?.scoreLeakCauses?.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-indigo-200/70 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-900 uppercase">Identified Leaks:</span>
                {analysis.overallScoreDiagnostic.scoreLeakCauses.map((cause, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-white border border-rose-200 text-rose-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
                  >
                    <ShieldAlert className="w-3 h-3 text-rose-500" /> {cause}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Practical Execution Mechanics: "How It Works For You" */}
          {analysis.howItWorksForYou && analysis.howItWorksForYou.length > 0 && (
            <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-600" /> How It Works For You: Real-Time Exam Hall Mechanics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Why you make these mistakes and how to physically execute during the 180-minute countdown.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  Actionable Strategy
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.howItWorksForYou.map((item, idx) => (
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

          {/* Sectional Mastery Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" /> Section-by-Section Mistake Analysis & Action Plan
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Click section to view</span>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {(["quant", "reasoning", "ga", "english"] as const).map((tabKey) => {
                const isActive = activeSectionTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveSectionTab(tabKey)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition border ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {secIcons[tabKey]}
                    <span>{secTitles[tabKey]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content Card */}
            {currentSec && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Strength Areas */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Working Well
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {currentSec.strengthAreas?.length > 0 ? (
                      currentSec.strengthAreas.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No major strengths recorded</li>
                    )}
                  </ul>
                </div>

                {/* Mistake Patterns */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Mistake Patterns
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {currentSec.mistakePatterns?.length > 0 ? (
                      currentSec.mistakePatterns.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No specific errors flagged</li>
                    )}
                  </ul>
                </div>

                {/* Concrete Action Plan */}
                <div className="space-y-2 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100">
                  <span className="text-[11px] font-black uppercase text-indigo-900 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Remedial Drill
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                    {currentSec.actionPlan?.length > 0 ? (
                      currentSec.actionPlan.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">Follow standard revision</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Time Management & Negative Marking Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Management Critique */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-amber-600" /> Time Management & Pacing
              </h4>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Ideal Blueprint: {analysis.timeManagementReview?.recommendedTimeAllocation}
              </p>
              <div className="space-y-1.5">
                {analysis.timeManagementReview?.timeTraps?.map((trap, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{trap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative Marking Strategy */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Negative Marking Drain (-0.25)
              </h4>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 mb-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-rose-900">
                  <span>Net Marks Lost to Wild Guesses:</span>
                  <span className="text-base font-black text-rose-700">
                    -{analysis.negativeMarkingStrategy?.marksLostToWildGuesses || 0} marks
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {analysis.negativeMarkingStrategy?.accuracyTargetAdvice}
              </p>
            </div>
          </div>

          {/* Actionable Study Roadmap Aligned to 10 Days */}
          {analysis.actionableStudyRoadmap?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-indigo-600" /> Next Mock Preparation Roadmap (10-Day Exam Countdown)
                </h4>
                <span className="text-[11px] font-bold text-slate-500">Official Exam: Sept 15</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.actionableStudyRoadmap.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-indigo-900 font-bold text-xs">
                      <span>{step.phase}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800">{step.focus}</p>
                    <ul className="space-y-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                      {step.tasks?.map((t, ti) => (
                        <li key={ti} className="flex items-start gap-1">
                          <span className="text-indigo-600 font-bold">›</span>
                          <span>{t}</span>
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
