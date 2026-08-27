"use client";

import React from "react";
import { useTestStore } from "@/store/testStore";
import { AlertCircle, CheckCircle2, Bookmark, Clock, X, Send } from "lucide-react";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { answers, remainingSeconds, isSubmitting } = useTestStore();

  if (!isOpen) return null;

  let answered = 0;
  let marked = 0;
  let unanswered = 0;
  let notVisited = 0;

  Object.values(answers).forEach((a) => {
    if (a.status === "answered" || a.status === "answered_marked") {
      answered++;
    }
    if (a.status === "marked") {
      marked++;
    }
    if (a.status === "unanswered") {
      unanswered++;
    }
    if (a.status === "not_visited") {
      notVisited++;
    }
  });

  const totalNotAttempted = unanswered + notVisited + marked;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-exam-primary text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Submit Examination?</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Stats Breakdown */}
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-5 leading-relaxed">
            Please review your examination summary before final submission. Once submitted, you cannot change your answers.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Answered</span>
                <span className="text-xl font-black text-emerald-700">{answered}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-rose-800 uppercase block">Unanswered</span>
                <span className="text-xl font-black text-rose-700">{totalNotAttempted}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-3">
              <Bookmark className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-purple-800 uppercase block">Marked Review</span>
                <span className="text-xl font-black text-purple-700">{marked}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3">
              <Clock className="w-6 h-6 text-slate-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase block">Time Left</span>
                <span className="text-base font-mono font-bold text-slate-800">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            </div>
          </div>

          {totalNotAttempted > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              ⚠️ You still have <strong>{totalNotAttempted} questions</strong> unanswered. Are you sure you want to finish now?
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              Resume Test
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-exam-danger hover:bg-red-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Yes, Submit"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
