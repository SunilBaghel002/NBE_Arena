"use client";

import React from "react";
import Link from "next/link";
import { History, ArrowRight, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Attempt } from "@/types";
import { formatAttemptRows } from "@/lib/analytics-helpers";
import { FormattedAttemptRow } from "@/types/analytics";

interface RecentAttemptsTableProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const RecentAttemptsTable: React.FC<RecentAttemptsTableProps> = ({
  attempts,
}) => {
  const rows: FormattedAttemptRow[] = formatAttemptRows(attempts);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-exam-primary" />
              <span>Recent Attempt Records & Scorecards</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed performance history with official answer keys & review links
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {rows.length} {rows.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {/* Table Viewport */}
        {rows.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium">No completed test attempts recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-slate-200 shadow-xs">
                <tr>
                  <th className="py-3 px-4">Mock Paper</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Net Score</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-center">Time Spent</th>
                  <th className="py-3 px-4 text-right">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition hover:bg-blue-50/40 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block truncate max-w-[200px] sm:max-w-xs">
                        {row.mockTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ID: {row.id.slice(0, 16)}...
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {row.dateFormatted}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="font-black text-slate-900 font-mono text-sm">
                        {row.netScore}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 200
                        </span>
                      </div>
                      <span
                        className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded mt-0.5 ${
                          row.qualifyingCleared
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {row.qualifyingCleared ? "QUALIFIED" : "BELOW TARGET"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.accuracy}%
                    </td>

                    <td className="py-3 px-4 text-center text-slate-500 font-mono whitespace-nowrap">
                      {row.timeFormatted}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/results/${row.id}`}
                        className="inline-flex items-center gap-1 bg-exam-primary hover:bg-exam-primaryHover text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition transform active:scale-95"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Target Benchmark: 150/200 Net Marks</span>
        <span>Review mode includes step-by-step explanations</span>
      </div>
    </div>
  );
};
