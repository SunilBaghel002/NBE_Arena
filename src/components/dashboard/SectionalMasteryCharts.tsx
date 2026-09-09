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
  Cell,
} from "recharts";
import { BarChart2, ShieldCheck, AlertCircle, Compass, Info } from "lucide-react";
import { Attempt, SectionType } from "@/types";
import { computeSectionalMastery } from "@/lib/analytics-helpers";
import { SectionalMasteryData } from "@/types/analytics";

interface SectionalMasteryChartsProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const SectionalMasteryCharts: React.FC<SectionalMasteryChartsProps> = ({
  attempts,
}) => {
  const [viewMode, setViewMode] = useState<"radar" | "bar">("radar");
  const [hoveredSection, setHoveredSection] = useState<SectionType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data: SectionalMasteryData = computeSectionalMastery(attempts);
  const totalScored = attempts.filter((a) => a.score).length;

  const reasoningAcc = data.bySection.REASONING.avgAccuracy;
  const gaAcc = data.bySection.GA.avgAccuracy;
  const quantAcc = data.bySection.QUANT.avgAccuracy;
  const englishAcc = data.bySection.ENGLISH.avgAccuracy;

  // GitHub 4-Pillar Cross Chart Dimensions
  const svgWidth = 360;
  const svgHeight = 240;
  const cx = 180;
  const cy = 118;
  const R = 72; // Maximum axis radius

  // Clamped percentage coordinates (0% = center, 100% = R)
  const yTop = cy - (Math.min(100, Math.max(2, reasoningAcc)) / 100) * R;
  const xRight = cx + (Math.min(100, Math.max(2, gaAcc)) / 100) * R;
  const yBottom = cy + (Math.min(100, Math.max(2, quantAcc)) / 100) * R;
  const xLeft = cx - (Math.min(100, Math.max(2, englishAcc)) / 100) * R;

  const polygonPoints = `${cx},${yTop} ${xRight},${cy} ${cx},${yBottom} ${xLeft},${cy}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
      <div>
        {/* Header with View Toggle & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-exam-primary" />
              <span>Sectional Mastery & Balance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              4 Exam Pillars · 50 Qs each · GitHub-style Quadrant Balance
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("radar")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === "radar"
                  ? "bg-white text-exam-primary shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              4-Pillar Radar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === "bar"
                  ? "bg-white text-exam-primary shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bar (Marks / 50)
            </button>
          </div>
        </div>

        {/* Section Highlights Badges */}
        {totalScored > 0 && (
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block leading-tight">
                  Strongest Section
                </span>
                <span className="text-xs font-extrabold text-emerald-900 truncate block">
                  {data.bySection[data.bestSection].label} ({data.bySection[data.bestSection].avgAccuracy}%)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-800 block leading-tight">
                  Needs Attention
                </span>
                <span className="text-xs font-extrabold text-rose-900 truncate block">
                  {data.bySection[data.weakestSection].label} ({data.bySection[data.weakestSection].avgAccuracy}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chart Viewport */}
        {totalScored === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium">
              Take your first mock test to generate sectional balance diagnostics.
            </p>
          </div>
        ) : !isMounted ? (
          <div className="h-60 w-full bg-slate-50 animate-pulse rounded-xl" />
        ) : viewMode === "radar" ? (
          /* GitHub 4-Pillar Cross Radar Chart */
          <div className="h-60 w-full flex items-center justify-center relative select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full max-w-[400px] overflow-visible"
            >
              {/* Concentric Diamond Guidelines (25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((scale) => {
                const r = R * scale;
                const dPts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
                return (
                  <polygon
                    key={scale}
                    points={dPts}
                    fill="none"
                    stroke={scale === 1.0 ? "#CBD5E1" : "#E2E8F0"}
                    strokeWidth={scale === 1.0 ? "1.5" : "1"}
                    strokeDasharray={scale === 1.0 ? "none" : "3 3"}
                  />
                );
              })}

              {/* 4 Green Cross Axis Lines */}
              {/* Horizontal Axis: English (Left) <-> General Awareness (Right) */}
              <line
                x1={cx - R}
                y1={cy}
                x2={cx + R}
                y2={cy}
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Vertical Axis: Reasoning (Top) <-> Quantitative (Bottom) */}
              <line
                x1={cx}
                y1={cy - R}
                x2={cx}
                y2={cy + R}
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Center Origin Dot */}
              <circle cx={cx} cy={cy} r="3" fill="#10B981" />

              {/* Filled Polygon Connecting the 4 Pillar Points */}
              <polygon
                points={polygonPoints}
                fill="rgba(16, 185, 129, 0.28)"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />

              {/* Top Axis: Reasoning Point & Labels */}
              <g
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredSection("REASONING")}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <circle
                  cx={cx}
                  cy={yTop}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="2.5"
                  className="transition-all duration-300 group-hover:r-7"
                />
                <circle cx={cx} cy={yTop} r="2" fill="#059669" />
                <text
                  x={cx}
                  y={cy - R - 16}
                  textAnchor="middle"
                  className="text-[12px] font-black fill-slate-900 font-mono tracking-tight"
                >
                  {reasoningAcc}%
                </text>
                <text
                  x={cx}
                  y={cy - R - 4}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-600 tracking-wide uppercase"
                >
                  Reasoning
                </text>
              </g>

              {/* Right Axis: General Awareness Point & Labels */}
              <g
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredSection("GA")}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <circle
                  cx={xRight}
                  cy={cy}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="2.5"
                  className="transition-all duration-300 group-hover:r-7"
                />
                <circle cx={xRight} cy={cy} r="2" fill="#059669" />
                <text
                  x={cx + R + 10}
                  y={cy - 4}
                  textAnchor="start"
                  className="text-[12px] font-black fill-slate-900 font-mono tracking-tight"
                >
                  {gaAcc}%
                </text>
                <text
                  x={cx + R + 10}
                  y={cy + 8}
                  textAnchor="start"
                  className="text-[10px] font-bold fill-slate-600 tracking-wide uppercase"
                >
                  Gen. Awareness
                </text>
              </g>

              {/* Bottom Axis: Quantitative Aptitude Point & Labels */}
              <g
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredSection("QUANT")}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <circle
                  cx={cx}
                  cy={yBottom}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="2.5"
                  className="transition-all duration-300 group-hover:r-7"
                />
                <circle cx={cx} cy={yBottom} r="2" fill="#059669" />
                <text
                  x={cx}
                  y={cy + R + 16}
                  textAnchor="middle"
                  className="text-[12px] font-black fill-slate-900 font-mono tracking-tight"
                >
                  {quantAcc}%
                </text>
                <text
                  x={cx}
                  y={cy + R + 28}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-600 tracking-wide uppercase"
                >
                  Quantitative
                </text>
              </g>

              {/* Left Axis: English Comprehension Point & Labels */}
              <g
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredSection("ENGLISH")}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <circle
                  cx={xLeft}
                  cy={cy}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="2.5"
                  className="transition-all duration-300 group-hover:r-7"
                />
                <circle cx={xLeft} cy={cy} r="2" fill="#059669" />
                <text
                  x={cx - R - 10}
                  y={cy - 4}
                  textAnchor="end"
                  className="text-[12px] font-black fill-slate-900 font-mono tracking-tight"
                >
                  {englishAcc}%
                </text>
                <text
                  x={cx - R - 10}
                  y={cy + 8}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-slate-600 tracking-wide uppercase"
                >
                  English
                </text>
              </g>
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredSection && (
              <div className="absolute top-2 right-2 bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 pointer-events-none backdrop-blur-sm z-20">
                <span className="font-bold text-emerald-400 block">
                  {data.bySection[hoveredSection].label}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  Accuracy: <strong>{data.bySection[hoveredSection].avgAccuracy}%</strong>
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Avg Net: {data.bySection[hoveredSection].avgNet} / 50 marks
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Horizontal Bar Chart */
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.barData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 50]}
                  ticks={[0, 10, 20, 30, 40, 50]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="section"
                  tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="avgNet" radius={[0, 6, 6, 0]} barSize={18}>
                  {data.barData.map((entry) => (
                    <Cell
                      key={entry.sectionKey}
                      fill={
                        entry.isBest
                          ? "#10B981"
                          : entry.isWeakest
                          ? "#EF4444"
                          : "#2563EB"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Metrics Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
        {data.barData.map((item) => (
          <div key={item.sectionKey} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">
              {item.section}
            </span>
            <span className="text-xs font-black text-slate-800 font-mono tabular-nums block mt-0.5">
              {item.avgNet} <span className="text-[9px] text-slate-400 font-normal">/50</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold font-mono">
              {item.accuracy}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomBarTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-700">
        <p className="font-bold text-slate-200">{d.section}</p>
        <p className="text-blue-300 font-mono font-bold mt-1">
          Avg Net Score: {d.avgNet} / 50 marks
        </p>
        <p className="text-emerald-400 font-mono font-semibold">
          Accuracy: {d.accuracy}%
        </p>
      </div>
    );
  }
  return null;
};
