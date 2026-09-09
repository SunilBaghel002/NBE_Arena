"use client";

import React from "react";
import { useTestStore } from "@/store/testStore";
import { SectionType } from "@/types";
import { AlertCircle, CheckCircle2, Bookmark, Clock, X, Send, ShieldAlert } from "lucide-react";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SECTION_SHORT: Record<SectionType, string> = {
  REASONING: "Reasoning & Intelligence",
  GA: "General Awareness",
  QUANT: "Quantitative Aptitude",
  ENGLISH: "English Comprehension",
};

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { sections, answers, remainingSeconds, isSubmitting } = useTestStore();

  if (!isOpen) return null;

  const sectionsList: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];

  // Compute breakdown per section
  const breakdown = sectionsList.map((sec) => {
    const qIds = sections[sec] || [];
    let ansCount = 0;
    let notAnsCount = 0;
    let markedCount = 0;
    let notVisCount = 0;

    qIds.forEach((id) => {
      const a = answers[id];
      const status = a?.status || "not_visited";
      if (status === "answered" || status === "answered_marked") ansCount++;
      else if (status === "unanswered") notAnsCount++;
      else if (status === "marked") markedCount++;
      else notVisCount++;
    });

    return {
      sec,
      name: SECTION_SHORT[sec],
      total: qIds.length || 50,
      answered: ansCount,
      notAnswered: notAnsCount,
      marked: markedCount,
      notVisited: notVisCount,
    };
  });

  const totalAnswered = breakdown.reduce((acc, b) => acc + b.answered, 0);
  const totalNotAnswered = breakdown.reduce((acc, b) => acc + b.notAnswered, 0);
  const totalMarked = breakdown.reduce((acc, b) => acc + b.marked, 0);
  const totalNotVisited = breakdown.reduce((acc, b) => acc + b.notVisited, 0);
  const totalQuestions = breakdown.reduce((acc, b) => acc + b.total, 0);
  const totalUnattempted = totalNotAnswered + totalNotVisited + totalMarked;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                Submit Examination Confirmation
              </h3>
              <p className="text-xs text-slate-500">
                Official NBEMS Junior Assistant Computer Based Test Summary
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Top Quick Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Answered</span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{totalAnswered}</span>
              <span className="text-[10px] text-emerald-600">Will be evaluated</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-800 block">Not Answered</span>
              <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{totalNotAnswered}</span>
              <span className="text-[10px] text-rose-600">0.00 marks</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-800 block">Marked Review</span>
              <span className="text-xl font-black text-purple-700 font-mono mt-0.5 block">{totalMarked}</span>
              <span className="text-[10px] text-purple-600">Unanswered</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Time Remaining</span>
              <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">{formatTime(remainingSeconds)}</span>
              <span className="text-[10px] text-slate-500">Continuous timer</span>
            </div>
          </div>

          {/* Section Breakdown Table (Standard TCS iON Exam Summary) */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">
              Sectional Performance Summary
            </span>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Section Name</th>
                    <th className="py-2.5 px-2 text-center">Total</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700">Answered</th>
                    <th className="py-2.5 px-2 text-center text-rose-700">Not Ans.</th>
                    <th className="py-2.5 px-2 text-center text-purple-700">Marked</th>
                    <th className="py-2.5 px-2 text-center text-slate-600">Not Visited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
                  {breakdown.map((row) => (
                    <tr key={row.sec} className="hover:bg-slate-50/80 transition font-medium">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900">{row.name}</td>
                      <td className="py-2 px-2 text-center">{row.total}</td>
                      <td className="py-2 px-2 text-center text-emerald-700 font-bold">{row.answered}</td>
                      <td className="py-2 px-2 text-center text-rose-700">{row.notAnswered}</td>
                      <td className="py-2 px-2 text-center text-purple-700">{row.marked}</td>
                      <td className="py-2 px-2 text-center text-slate-500">{row.notVisited}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-200 text-xs">
                    <td className="py-2.5 px-3 font-sans">Total Paper (All Sections)</td>
                    <td className="py-2.5 px-2 text-center">{totalQuestions}</td>
                    <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">{totalAnswered}</td>
                    <td className="py-2.5 px-2 text-center text-rose-700">{totalNotAnswered}</td>
                    <td className="py-2.5 px-2 text-center text-purple-700">{totalMarked}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600">{totalNotVisited}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning notice if unattempted questions */}
          {totalUnattempted > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> You have <strong>{totalUnattempted} questions unattempted</strong>. Once submitted, your examination will be finalized and evaluated against the official +1.00 / −0.25 marking formula.
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition shadow-xs"
          >
            Resume Examination
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-exam-danger hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Finalizing & Submitting..." : "Yes, Submit Final Paper"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
