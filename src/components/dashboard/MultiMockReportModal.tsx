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
  Award,
  Zap,
  ShieldAlert,
  CalendarCheck,
  Flame,
  X,
  Download,
  FileText,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { MultiMockAIAnalysis } from "@/types";

interface MultiMockReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  totalAttempts: number;
}

export function MultiMockReportModal({
  isOpen,
  onClose,
  candidateName,
  totalAttempts,
}: MultiMockReportModalProps) {
  const [report, setReport] = useState<MultiMockAIAnalysis | null>(null);
  const [checkingCache, setCheckingCache] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Load cached report when modal opens
  useEffect(() => {
    if (!isOpen || totalAttempts < 1) return;

    async function checkSavedReport() {
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
        console.error("Error loading cached AI report:", err);
      } finally {
        setCheckingCache(false);
      }
    }

    checkSavedReport();
  }, [isOpen, totalAttempts]);

  // Generate fresh report via Groq LLM
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
      setError(err instanceof Error ? err.message : "Error generating AI report");
    } finally {
      setGenerating(false);
    }
  };

  // Download Report as Markdown Document
  const handleDownloadReport = () => {
    if (!report) return;

    const attemptHistoryText =
      report.netScoreProgression
        ?.map(
          (p, i) =>
            `  Mock #${i + 1} (${p?.mockTitle || `Mock #${i + 1}`}): ${p?.netScore ?? 0}/200 marks | Accuracy: ${p?.accuracy ?? 0}% | Penalty: -${p?.penalty ?? 0} marks`
        )
        .join("\n") || "  None";

    const strengthsText =
      report.longitudinalStrengths?.map((s) => `  * ${s}`).join("\n") || "  None identified";

    const weaknessesText =
      report.chronicWeaknesses
        ?.map(
          (w) =>
            `  * [${w?.section || "GENERAL"}] ${w?.pattern || ""} (Severity: ${w?.severity || "MEDIUM"})\n    Remedy: ${w?.remedy || ""}`
        )
        .join("\n") || "  None identified";

    const reasoningPlan =
      report.reasoningDeepDive?.stepByStepImprovement?.map((s) => `  * ${s}`).join("\n") ||
      "  None";

    const mathPlan =
      report.mathematicsDeepDive?.stepByStepImprovement?.map((s) => `  * ${s}`).join("\n") ||
      "  None";

    const rulesText =
      report.howItWorksForYou
        ?.map(
          (r) =>
            `  [${r?.section || "STRATEGY"}] ${r?.title || ""} (Expected Jump: ${r?.expectedMarkJump || "+0 marks"})\n  Mistake: ${r?.mistakeBreakdown || ""}\n  Rule: ${r?.realTimeExecutionRule || ""}\n`
        )
        .join("\n") || "  Standard pacing rules apply.";

    const scheduleText =
      report.personalizedMasterPlan
        ?.map(
          (p) =>
            `  ${p?.weekOrDay || "Sprint"} — Goal: ${p?.goal || "Practice"}\n  ${(p?.dailyActionItems || []).map((a) => `    - ${a}`).join("\n")}`
        )
        .join("\n\n") || "  Consistent daily mock practice.";

    const content = `# NBE Arena — AI Multi-Mock Strategic Audit
Candidate: ${candidateName}
Generated At: ${report.generatedAt ? new Date(report.generatedAt).toLocaleString() : new Date().toLocaleString()}
Model: ${report.model || "Groq LLaMA 3.3"} (${report.provider || "Groq"})
Sessions Analyzed: ${report.totalMocksAnalyzed || totalAttempts} Full Mock Attempts
Benchmark Target: 150 / 200 Net Marks (NBEMS Jr. Assistant)

=======================================================
1. EXECUTIVE TRAJECTORY & PLATEAU ASSESSMENT
=======================================================
${report.scoreTrajectorySummary || "Longitudinal score analysis across mock tests."}

Attempt History Progression:
${attemptHistoryText}

=======================================================
2. PROVEN LONGITUDINAL STRENGTHS
=======================================================
${strengthsText}

=======================================================
3. CHRONIC SCORE LEAKS & HABITUAL PITFALLS
=======================================================
${weaknessesText}

=======================================================
4. DEEP-DIVE SECTION ACTION PLANS
=======================================================

[GENERAL INTELLIGENCE & REASONING]
Status: ${report.reasoningDeepDive?.status || "Analyzing"}
Observed Errors:
${report.reasoningDeepDive?.observedErrors?.map((e) => `  * ${e}`).join("\n") || "  None"}
Action Plan:
${reasoningPlan}

[QUANTITATIVE APTITUDE]
Status: ${report.mathematicsDeepDive?.status || "Analyzing"}
Observed Errors:
${report.mathematicsDeepDive?.observedErrors?.map((e) => `  * ${e}`).join("\n") || "  None"}
Action Plan:
${mathPlan}

=======================================================
5. REAL-TIME EXAM HALL EXECUTION RULES
=======================================================
${rulesText}

=======================================================
6. TIME ALLOCATION CRITIQUE
=======================================================
Detected Imbalance: ${report.timeAllocationCritique?.detectedImbalance || "None"}
Ideal Strategy: ${report.timeAllocationCritique?.idealStrategy || "Allocate 45 minutes per section."}

=======================================================
7. PERSONALIZED MASTER ROADMAP
=======================================================
${scheduleText}

=======================================================
Report generated by NBE Arena AI Mentor (Groq LLaMA 3.3 70B)
`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NBE_Arena_Strategic_Audit_${candidateName}_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  AI Multi-Mock Strategic Audit
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Groq LLaMA 3.3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Longitudinal diagnosis for <strong>{candidateName}</strong> · {totalAttempts} mock attempts analyzed
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {report && (
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition shadow-xs"
                title="Download full strategic audit document"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Download Report</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Internal Scrolling Only */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800">
          {checkingCache ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-exam-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Checking saved candidate strategic reports...</p>
            </div>
          ) : !report ? (
            <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Synthesize Multi-Mock Strategic Audit
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Our Groq AI mentor analyzes recurring errors, time overruns, and negative marking penalty leaks across all {totalAttempts} mock tests to formulate your personalized exam roadmap.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing {totalAttempts} attempts via Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Strategic Audit Now</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Render Full Multi-Mock Audit Content */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 1. Trajectory Summary & Score Progression */}
              <div className="bg-indigo-50/70 rounded-2xl p-5 border border-indigo-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> Score Trajectory & Plateau Assessment
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800">
                      150 Target Benchmark
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {report.scoreTrajectorySummary || "Comprehensive trajectory analysis across candidate mock tests."}
                </p>

                {/* Trajectory Progression Pills */}
                {report.netScoreProgression && report.netScoreProgression.length > 0 && (
                  <div className="pt-2 border-t border-indigo-200/60 flex flex-wrap items-center gap-2 font-mono">
                    <span className="text-[11px] font-bold text-indigo-950 uppercase font-sans">
                      Attempt Progression:
                    </span>
                    {report.netScoreProgression.map((prog, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs shadow-2xs"
                      >
                        <span className="font-bold text-slate-700">M{i + 1}:</span>
                        <span className="font-black text-indigo-900">{prog?.netScore ?? 0}</span>
                        <span className="text-[10px] text-slate-400">({prog?.accuracy ?? 0}%)</span>
                        {(prog?.penalty ?? 0) > 0 && (
                          <span className="text-[10px] text-rose-600 font-semibold">
                            -{prog.penalty}p
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Longitudinal Strengths & Chronic Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Proven Longitudinal Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950 pt-1">
                    {report.longitudinalStrengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                        <span className="font-medium">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chronic Weaknesses */}
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Chronic Score Leaks & Pitfalls
                  </h4>
                  <div className="space-y-2 pt-1 text-xs">
                    {report.chronicWeaknesses?.map((w, idx) => (
                      <div key={idx} className="p-2.5 bg-white/90 rounded-xl border border-rose-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-rose-900 uppercase text-[10px]">
                            {w.section}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                            {w.severity}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">{w.pattern}</p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          <strong>Fix:</strong> {w.remedy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Deep-Dive Section Action Plans */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Targeted Subject Deep Dives
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reasoning */}
                  {report.reasoningDeepDive && (
                    <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">General Intelligence & Reasoning</span>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          {report.reasoningDeepDive.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-[10px] uppercase tracking-wider text-rose-700 block font-bold">Observed Errors:</strong>
                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                          {report.reasoningDeepDive.observedErrors?.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-blue-100">
                        <strong className="text-[10px] uppercase tracking-wider text-emerald-700 block font-bold">Step-by-Step Fix:</strong>
                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                          {report.reasoningDeepDive.stepByStepImprovement?.map((stp, i) => (
                            <li key={i}>✓ {stp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Mathematics / Quant */}
                  {report.mathematicsDeepDive && (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Quantitative Aptitude</span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {report.mathematicsDeepDive.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-[10px] uppercase tracking-wider text-rose-700 block font-bold">Observed Errors:</strong>
                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                          {report.mathematicsDeepDive.observedErrors?.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-amber-100">
                        <strong className="text-[10px] uppercase tracking-wider text-emerald-700 block font-bold">Step-by-Step Fix:</strong>
                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                          {report.mathematicsDeepDive.stepByStepImprovement?.map((stp, i) => (
                            <li key={i}>✓ {stp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Real-Time Execution Rules */}
              {report.howItWorksForYou && report.howItWorksForYou.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" /> Practical Real-Time Exam Hall Execution Rules
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Game-Changers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {report.howItWorksForYou.map((rule, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-indigo-900">
                            {rule.section}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {rule.expectedMarkJump}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 leading-snug">{rule.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{rule.realTimeExecutionRule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Master Countdown Roadmap */}
              {report.personalizedMasterPlan && report.personalizedMasterPlan.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4" /> Personalized Final Sprint Roadmap
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">180 Mins CBT Target</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {report.personalizedMasterPlan.map((plan, idx) => (
                      <div key={idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5">
                        <span className="text-[10px] text-amber-300 font-bold block uppercase">
                          {plan.weekOrDay}
                        </span>
                        <h5 className="font-bold text-white leading-snug">{plan.goal}</h5>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {plan.dailyActionItems?.map((act, i) => (
                            <li key={i}>• {act}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {report.timeAllocationCritique && (
                    <div className="pt-2 text-[11px] text-slate-300 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span><strong>Detected Imbalance:</strong> {report.timeAllocationCritique.detectedImbalance}</span>
                      <span className="text-amber-300"><strong>Strategy:</strong> {report.timeAllocationCritique.idealStrategy}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Re-generate Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Model: {report.model} via {report.provider}
                </span>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
                  <span>Re-analyze All Attempts</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
