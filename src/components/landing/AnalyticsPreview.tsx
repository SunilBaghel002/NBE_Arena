"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart2,
  AlertTriangle,
  Brain,
  Sparkles,
} from "lucide-react";

export const AnalyticsPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"trajectory" | "sections" | "negative" | "ai">("trajectory");

  const attemptsData = [
    { id: 1, name: "NBE Mock #01", score: 124.5, date: "Aug 12", accuracy: 71.4, qualified: false },
    { id: 2, name: "NBE Mock #02", score: 136.25, date: "Aug 18", accuracy: 76.8, qualified: false },
    { id: 3, name: "NBE Mock #03", score: 144.0, date: "Aug 25", accuracy: 80.2, qualified: false },
    { id: 4, name: "NBE Mock #04", score: 154.75, date: "Sep 01", accuracy: 84.2, qualified: true },
    { id: 5, name: "NBE Mock #05", score: 158.5, date: "Sep 05", accuracy: 86.1, qualified: true },
  ];

  const sectionData = [
    { name: "General Intelligence & Reasoning", code: "GI", score: 46.25, total: 50, accuracy: 94.0, strong: true },
    { name: "General Awareness", code: "GA", score: 38.5, total: 50, accuracy: 78.5, strong: false },
    { name: "Quantitative Aptitude", code: "QA", score: 32.75, total: 50, accuracy: 68.2, weak: true },
    { name: "English Comprehension", code: "EN", score: 41.0, total: 50, accuracy: 84.0, strong: false },
  ];

  return (
    <section id="analytics" className="py-20 md:py-28 bg-white text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Candidate Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Institutional Diagnostic Analytics
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Move beyond crude pass/fail percentages. Give candidates and faculty instant visibility
            into score trajectory, sectional mastery, guessing leakage, and AI-guided remediation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: "trajectory", label: "Score Trajectory & 150 Target", icon: TrendingUp },
            { id: "sections", label: "4-Section Mastery & Accuracy", icon: BarChart2 },
            { id: "negative", label: "−0.25 Penalty Leakage", icon: AlertTriangle },
            { id: "ai", label: "AI Multi-Mock Diagnostic Report", icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-500"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? "text-white" : "text-amber-600"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Preview Display Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8">
          {/* TAB 1: Score Trajectory */}
          {activeTab === "trajectory" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> Net Score Progression & 150 Target
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continuous tracking of candidate net marks against the 150/200 (75% net) qualifying benchmark.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                  Benchmark: 150 / 200 Net Marks
                </span>
              </div>

              {/* Progress Bars List */}
              <div className="space-y-4 pt-2">
                {attemptsData.map((att) => {
                  const pct = (att.score / 200) * 100;
                  return (
                    <div key={att.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">
                          {att.name} <span className="text-slate-400">({att.date})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Accuracy: {att.accuracy}%</span>
                          <span className={`font-mono font-bold ${att.qualified ? "text-emerald-600" : "text-amber-600"}`}>
                            {att.score.toFixed(2)} / 200 marks
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                        {/* 150 Benchmark Target Marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                          style={{ left: "75%" }}
                          title="150 Target Benchmark"
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            att.qualified
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                <span>0 Marks</span>
                <span className="text-rose-600 font-bold">150 Benchmark (75%)</span>
                <span>200 Marks</span>
              </div>
            </div>
          )}

          {/* TAB 2: Sectional Mastery */}
          {activeTab === "sections" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-600" /> Sectional Mastery & Accuracy Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Each section contains 50 Questions (50 Marks). Analyzes sectional net scores and accuracy rates.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full w-fit">
                  4 Sections × 50 Marks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {sectionData.map((sec) => (
                  <div
                    key={sec.name}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{sec.name}</span>
                      {sec.strong && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          Highest Section
                        </span>
                      )}
                      {sec.weak && (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                          Needs Remediation
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-2xl font-black text-slate-900">{sec.score}</span>
                      <span className="text-xs text-slate-500">/ 50.00 Net</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sec.strong
                            ? "bg-emerald-500"
                            : sec.weak
                            ? "bg-rose-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${sec.accuracy}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Section Accuracy</span>
                      <span className="font-bold text-slate-900">{sec.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Negative Marking Penalty Leakage */}
          {activeTab === "negative" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" /> Negative Marking Penalty Physics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official NBEMS Penalty: Every wrong answer subtracts −0.25 marks from earned score.
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full w-fit">
                  Formula: Net = Correct − (Wrong × 0.25)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Earned Marks</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">162.50</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">165 Correct × 1.00</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-center ring-1 ring-rose-300">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Penalty Marks Lost</span>
                  <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">−7.75</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">31 Wrong × 0.25 Penalty</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Qualifying Score</span>
                  <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">154.75</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Target 150 Cleared (+4.75)</span>
                </div>
              </div>

              {/* Coaching Insight Card */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> The High Cost of Unchecked Wild Guessing:
                </p>
                <p className="leading-relaxed">
                  Candidate attempted 31 questions with low certainty, losing 7.75 net marks.
                  If the candidate had skipped 15 pure guesses, their net score would jump from{" "}
                  <strong className="text-slate-900">154.75</strong> to{" "}
                  <strong className="text-emerald-700">158.50+ marks</strong>.
                  Our diagnostics train candidates on strategic risk-taking before exam day.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AI Multi-Mock Strategic Audit */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" /> Groq-Powered Multi-Mock AI Audit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Synthesizes attempt history across 5+ full-length mocks to detect systemic weak spots.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full w-fit">
                  Llama-3.3-70B Synthesis
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Strategic Executive Summary for Candidate Batch #01</span>
                </div>

                <div className="space-y-2.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">1. Sectional Imbalance:</strong> General Intelligence
                    (46.25 avg) and English (41.0 avg) are examination-ready. However, Quantitative Aptitude
                    remains below the safety threshold (32.75 avg) due to time overrun in Profit & Loss and Time-Work questions.
                  </p>
                  <p>
                    <strong className="text-slate-900">2. Time Allocation Fatigue:</strong> Candidate spends an average
                    of 58 seconds on Reasoning and 68 seconds on Quant, leaving only 26 seconds per English question
                    during the final 30 minutes of the 180-minute countdown.
                  </p>
                  <p>
                    <strong className="text-slate-900">3. Remediation Action Plan:</strong> Enforce strict 45-minute
                    sectional time capping. Practice 100 targeted arithmetic word problems to eliminate the 7.75-mark
                    guessing penalty.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Diagnostic confidence: 96.4%</span>
                  <span className="text-amber-700 font-bold">Estimated Mark Lift: +12 to +18 Marks</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
