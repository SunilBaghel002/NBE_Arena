"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Target, Calendar, Info } from "lucide-react";
import { Attempt } from "@/types";
import { computeTrajectoryData } from "@/lib/analytics-helpers";
import { TrajectoryPoint } from "@/types/analytics";

interface ScoreTrajectoryChartProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const ScoreTrajectoryChart: React.FC<ScoreTrajectoryChartProps> = ({
  attempts,
}) => {
  const [range, setRange] = useState<"last5" | "last10" | "all">("last5");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data: TrajectoryPoint[] = computeTrajectoryData(attempts, range);
  const totalScored = attempts.filter((a) => a.score).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
      {/* Header with Title & Range Toggles */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-exam-primary" />
              <span>Score Trajectory & Benchmark</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Net score progression vs. the official 150 qualifying benchmark line
            </p>
          </div>

          {/* Filter Toggles */}
          {totalScored > 1 && (
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRange("last5")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  range === "last5"
                    ? "bg-white text-exam-primary shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Last 5
              </button>
              <button
                type="button"
                onClick={() => setRange("last10")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  range === "last10"
                    ? "bg-white text-exam-primary shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Last 10
              </button>
              <button
                type="button"
                onClick={() => setRange("all")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  range === "all"
                    ? "bg-white text-exam-primary shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({totalScored})
              </button>
            </div>
          )}
        </div>

        {/* Chart Container */}
        {totalScored === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Info className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">
              No completed mock tests yet. Take a test to plot your score trajectory.
            </p>
          </div>
        ) : !isMounted ? (
          <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl" />
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 200]}
                  ticks={[0, 50, 100, 150, 200]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTrajectoryTooltip />} />

                {/* 150 Qualifying Target Reference Line */}
                <ReferenceLine
                  y={150}
                  stroke="#0D9488"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: "150 Qualifying Target",
                    position: "insideTopRight",
                    fill: "#0D9488",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="netScore"
                  name="Net Score"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{
                    r: 6,
                    fill: "#1D4ED8",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
            <span className="font-semibold text-slate-700">Net Score (/200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-600 border-b border-dashed border-teal-600" />
            <span className="font-semibold text-teal-700">150 Benchmark Line</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Scoring: +1.00 Correct, −0.25 Wrong
        </span>
      </div>
    </div>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTrajectoryTooltip: React.FC<TooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data: TrajectoryPoint = payload[0].payload;
    const isQual = data.netScore >= 150;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-sm min-w-[200px]">
        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 flex justify-between items-center">
          <span className="truncate max-w-[140px]">{data.mockTitle}</span>
          <span className="text-[10px] text-slate-400 font-normal">{data.dateLabel}</span>
        </div>

        <div className="flex justify-between items-baseline pt-0.5 font-mono tabular-nums">
          <span className="text-slate-300">Net Score:</span>
          <span
            className={`font-black text-sm ${
              isQual ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {data.netScore} / 200
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-400 font-mono tabular-nums">
          <span>Correct (+1):</span>
          <span className="text-emerald-300 font-semibold">{data.rawScore}</span>
        </div>

        <div className="flex justify-between items-center text-slate-400 font-mono tabular-nums">
          <span>Penalty (−0.25):</span>
          <span className="text-rose-400 font-semibold">−{data.negativePenalty}</span>
        </div>

        <div className="flex justify-between items-center text-slate-400 font-mono tabular-nums">
          <span>Accuracy:</span>
          <span className="text-slate-200 font-bold">{data.accuracyPercentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};
