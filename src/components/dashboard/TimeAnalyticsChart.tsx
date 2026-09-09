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
  ReferenceLine,
  Cell,
} from "recharts";
import { Clock, AlertCircle, CheckCircle2, Timer, Zap } from "lucide-react";
import { Attempt } from "@/types";
import { computeTimeAnalytics } from "@/lib/analytics-helpers";
import { TimeAnalyticsData } from "@/types/analytics";

interface TimeAnalyticsChartProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const TimeAnalyticsChart: React.FC<TimeAnalyticsChartProps> = ({
  attempts,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data: TimeAnalyticsData = computeTimeAnalytics(attempts);
  const totalScored = attempts.filter((a) => a.score).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-exam-primary" />
              <span>Time Management & Pacing</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              180-minute total budget · 45-minute target per 50 questions
            </p>
          </div>

          {/* Quick Pacing Metric */}
          <div className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 self-start sm:self-auto">
            <Timer className="w-4 h-4 text-slate-600" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-tight">
                Pacing Speed
              </span>
              <span className="text-xs font-black font-mono text-slate-800">
                {data.avgSecondsPerQuestion}s / question{" "}
                <span className="text-[10px] text-slate-400 font-normal">
                  (Target: 54s)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Overrun Warning Banner */}
        {data.hasAnyOverrun && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-bold">Time Overrun Alert:</span> Average time in{" "}
              <strong>{data.overrunSections.join(", ")}</strong> exceeds the 45-minute budget.
              Consider capping time in this section to avoid rushing English or Quant.
            </div>
          </div>
        )}

        {/* Chart Viewport */}
        {totalScored === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Clock className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">
              Take mock tests to track your sectional time management.
            </p>
          </div>
        ) : !isMounted ? (
          <div className="h-56 w-full bg-slate-50 animate-pulse rounded-xl" />
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.sections}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 60]}
                  ticks={[0, 15, 30, 45, 60]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                  unit="m"
                />
                <Tooltip content={<CustomTimeTooltip />} />

                {/* 45 Min Target Reference Line */}
                <ReferenceLine
                  y={45}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: "45m Section Budget",
                    position: "insideTopRight",
                    fill: "#D97706",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />

                <Bar dataKey="avgMinutes" radius={[6, 6, 0, 0]} barSize={36}>
                  {data.sections.map((entry) => (
                    <Cell
                      key={entry.section}
                      fill={entry.isOverrun ? "#F59E0B" : "#2563EB"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600" />
            <span className="font-semibold text-slate-700">Within 45m Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span className="font-semibold text-amber-700">Overrun Risk (&gt;45m)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">Total CBT Clock: 180 Minutes</span>
      </div>
    </div>
  );
};

const CustomTimeTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOver = data.isOverrun;

    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-700 font-mono">
        <p className="font-bold text-slate-200 font-sans">{data.label}</p>
        <p className={`font-bold mt-1 ${isOver ? "text-amber-400" : "text-blue-300"}`}>
          Avg Time: {data.avgMinutes} mins
        </p>
        <p className="text-slate-400 text-[10px]">
          {isOver
            ? `Exceeds 45m target by +${(data.avgMinutes - 45).toFixed(1)} mins`
            : `Within 45m target (${(45 - data.avgMinutes).toFixed(1)}m buffer)`}
        </p>
      </div>
    );
  }
  return null;
};
