"use client";

import React from "react";
import Link from "next/link";
import { History, ArrowRight, ExternalLink, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Attempt } from "@/types";
import { formatAttemptRows } from "@/lib/analytics-helpers";
import { FormattedAttemptRow } from "@/types/analytics";
import { Badge } from "@/components/ui/Badge";

interface RecentAttemptsTableProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const RecentAttemptsTable: React.FC<RecentAttemptsTableProps> = ({
  attempts,
}) => {
  const rows: FormattedAttemptRow[] = formatAttemptRows(attempts);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-7 flex flex-col justify-between hover:shadow-card-hover transition-shadow duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-eyebrow block mb-1">Attempt Telemetry</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-exam-primary" />
              <span>Recent Attempt Records & Scorecards</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified performance history with official answer keys, time tracking & review
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-3 py-1 rounded-full shadow-xs">
            {rows.length} {rows.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {/* Table Viewport */}
        {rows.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-400">
            <History className="w-9 h-9 text-slate-300 mx-auto mb-2.5" />
            <p className="font-semibold text-slate-600">No completed test attempts recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Start a mock test from the left panel to populate attempt telemetry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 backdrop-blur-md text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-slate-200/90 shadow-xs">
                <tr>
                  <th className="py-3 px-4 font-extrabold">Mock Paper</th>
                  <th className="py-3 px-4 font-extrabold">Date</th>
                  <th className="py-3 px-4 text-center font-extrabold">Net Score</th>
                  <th className="py-3 px-4 text-center font-extrabold">Accuracy</th>
                  <th className="py-3 px-4 text-center font-extrabold">Time Spent</th>
                  <th className="py-3 px-4 text-right font-extrabold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition duration-150 group ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    } hover:bg-blue-50/50`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block truncate max-w-[180px] sm:max-w-xs group-hover:text-blue-700 transition">
                        {row.mockTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        ID: {row.id.slice(0, 14)}...
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                      {row.dateFormatted}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="font-black text-slate-900 font-mono text-sm">
                        {row.netScore}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 200
                        </span>
                      </div>
                      <Badge
                        variant={row.qualifyingCleared ? "emerald" : "rose"}
                        size="xs"
                        dot
                        className="mt-1"
                      >
                        {row.qualifyingCleared ? "QUALIFIED" : "BELOW TARGET"}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.accuracy}%
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-500 font-mono whitespace-nowrap text-[11px]">
                      {row.timeFormatted}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/results/${row.id}`}
                        className="inline-flex items-center gap-1.5 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition transform active:scale-95 group/btn"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>Benchmark: 150/200 Net Qualifying Marks</span>
        <span>Includes full explanation review</span>
      </div>
    </div>
  );
};
