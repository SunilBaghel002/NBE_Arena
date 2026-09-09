"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ShieldAlert, TrendingUp, HelpCircle, ArrowUpRight } from "lucide-react";
import { Attempt } from "@/types";
import { computeNegativeMarkingLeakage } from "@/lib/analytics-helpers";
import { NegativeMarkingLeakageData } from "@/types/analytics";

interface NegativeMarkingLeakageCardProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const NegativeMarkingLeakageCard: React.FC<NegativeMarkingLeakageCardProps> = ({
  attempts,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data: NegativeMarkingLeakageData = computeNegativeMarkingLeakage(attempts);
  const totalScored = attempts.filter((a) => a.score).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Negative Marking Penalty Leakage</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact marks destroyed by −0.25 penalty on incorrect guesses
            </p>
          </div>

          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 self-start sm:self-auto">
            Penalty: −0.25 / Wrong
          </span>
        </div>

        {/* Hero Leakage Metrics */}
        {totalScored > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                Total Marks Destroyed
              </span>
              <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                <span className="text-2xl font-black text-rose-600">
                  −{data.totalPenaltyMarksLost}
                </span>
                <span className="text-xs text-rose-400 font-bold">marks</span>
              </div>
              <span className="text-[10px] text-rose-600/80 block mt-0.5 font-medium">
                From {data.totalWrongAnswers} wrong answers
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Avg Penalty / Mock
              </span>
              <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                <span className="text-2xl font-black text-slate-900">
                  −{data.averagePenaltyPerMock}
                </span>
                <span className="text-xs text-slate-400 font-bold">marks</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Per 200 questions
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                Potential Score <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              </span>
              <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
                <span className="text-2xl font-black text-emerald-700">
                  ~{data.potentialNetScore}
                </span>
                <span className="text-xs text-emerald-600/80 font-bold">/ 200</span>
              </div>
              <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
                Score with zero wild guesses
              </span>
            </div>
          </div>
        )}

        {/* Stacked Bar Chart */}
        {totalScored === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">
              Take mock tests to track penalty leakage and optimize guessing discipline.
            </p>
          </div>
        ) : !isMounted ? (
          <div className="h-52 w-full bg-slate-50 animate-pulse rounded-xl" />
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.attemptsData}
                margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 200]}
                  ticks={[0, 50, 100, 150, 200]}
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomLeakageTooltip />} />
                <Bar
                  dataKey="correctMarks"
                  name="Correct Marks (+1)"
                  stackId="score"
                  fill="#10B981"
                  radius={[0, 0, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="penaltyLost"
                  name="Penalty Lost (−0.25)"
                  stackId="score"
                  fill="#EF4444"
                  radius={[0, 0, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Actionable Advice Snippet */}
      {totalScored > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 font-semibold">Strategic Advice:</strong>{" "}
            {data.adviceQuote}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomLeakageTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-700 font-mono space-y-1">
        <p className="font-bold text-slate-200 font-sans">{d.label}</p>
        <p className="text-emerald-400">Correct (+1): +{d.correctMarks}</p>
        <p className="text-rose-400">Penalty Lost: −{d.penaltyLost}</p>
        <p className="text-white font-bold border-t border-slate-700 pt-1">
          Net Score: {d.netScore} / 200
        </p>
      </div>
    );
  }
  return null;
};
