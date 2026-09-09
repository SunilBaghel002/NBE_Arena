"use client";

import React from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Percent,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { KpiMetrics } from "@/types/analytics";

interface EnhancedKpiRowProps {
  metrics: KpiMetrics;
}

export const EnhancedKpiRow: React.FC<EnhancedKpiRowProps> = ({ metrics }) => {
  const isQualifyingAvg = metrics.averageScore >= 150;
  const isTargetGapPositive = metrics.targetGap >= 0;

  return (
    <section aria-label="Candidate Performance Summary" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-exam-primary" /> Key Performance Indicators
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Benchmark Target: 150 / 200 Net Marks (75%)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Tests Completed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tests Taken
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-exam-primary flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {metrics.totalCompleted}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span>{metrics.qualifyingRate}% qualifying rate</span>
            </p>
          </div>
        </div>

        {/* 2. Average Net Score */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Average Score
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-exam-primary tracking-tight font-mono tabular-nums">
                {metrics.averageScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 200</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isQualifyingAvg ? (
                <span className="text-emerald-600 font-semibold">Above 150 target</span>
              ) : (
                <span className="text-amber-600 font-semibold">Under 150 benchmark</span>
              )}
            </p>
          </div>
        </div>

        {/* 3. Highest Net Score */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Highest Score
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight font-mono tabular-nums">
                {metrics.highestScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 200</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Personal record
            </p>
          </div>
        </div>

        {/* 4. Average Accuracy */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Accuracy
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {metrics.averageAccuracy}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Correct vs attempted
            </p>
          </div>
        </div>

        {/* 5. Total Practice Time */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Practice Time
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {metrics.practiceTimeFormatted}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              CBT hall time
            </p>
          </div>
        </div>

        {/* 6. Target Gap Indicator */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Target Gap
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition ${
                isTargetGapPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isTargetGapPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight font-mono tabular-nums ${
                isTargetGapPositive ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {isTargetGapPositive ? `+${metrics.targetGap}` : metrics.targetGap}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {isTargetGapPositive ? "Above 150 target" : "Marks to 150 benchmark"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
