"use client";

import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  Flame,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Attempt } from "@/types";
import {
  computeSectionalMastery,
  computeStrengthWeakness,
} from "@/lib/analytics-helpers";
import { StrengthWeaknessData } from "@/types/analytics";

interface StrengthWeaknessPanelProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const StrengthWeaknessPanel: React.FC<StrengthWeaknessPanelProps> = ({
  attempts,
}) => {
  const sectional = computeSectionalMastery(attempts);
  const data: StrengthWeaknessData = computeStrengthWeakness(
    sectional,
    attempts
  );
  const totalScored = attempts.filter((a) => a.score).length;

  if (totalScored === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Section Strengths & Focus Areas</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic comparison of highest accuracy sections vs. highest leak points
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top 2 Strongest Sections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Top Strengths (High Accuracy)
            </h4>
          </div>

          <div className="space-y-3">
            {data.strengths.map((item, idx) => (
              <div
                key={item.section}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/70 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.accuracyPercentage}% Acc
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-1.5 bg-white/80 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Avg Net</span>
                    <span className="font-bold font-mono text-slate-900">{item.avgNetScore} / 50</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Wrong Rate</span>
                    <span className="font-bold font-mono text-slate-700">{item.wrongRate}%</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Unattempted</span>
                    <span className="font-bold font-mono text-slate-700">{item.unattemptedRate}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  <strong className="text-emerald-800 font-semibold">Tactic:</strong> {item.advice}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 2 Weakest / Focus Sections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Priority Focus Areas (Score Leaks)
            </h4>
          </div>

          <div className="space-y-3">
            {data.weaknesses.map((item, idx) => (
              <div
                key={item.section}
                className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {item.accuracyPercentage}% Acc
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-1.5 bg-white/80 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Avg Net</span>
                    <span className="font-bold font-mono text-rose-700">{item.avgNetScore} / 50</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Wrong Rate</span>
                    <span className="font-bold font-mono text-rose-700">{item.wrongRate}%</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Unattempted</span>
                    <span className="font-bold font-mono text-slate-700">{item.unattemptedRate}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  <strong className="text-rose-800 font-semibold">Action:</strong> {item.advice}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
