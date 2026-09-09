"use client";

import React from "react";
import { X, ShieldCheck, Clock, BookOpen, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Examination Instructions & Guidelines
              </h3>
              <p className="text-xs text-slate-500">
                National Board of Examinations in Medical Sciences (NBEMS) · Official CBT Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200 transition"
            title="Close Instructions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* 1. General Rules */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>1. General Rules & Timer Policy</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>The digital countdown clock displayed in the header shows your remaining time (total 180:00 minutes).</li>
              <li>
                <strong className="text-slate-900">Automatic Submission at 00:00:00:</strong> When the countdown timer reaches zero, the examination will automatically submit your saved responses.
              </li>
              <li>All answered questions are continuously persisted in local storage in case of unexpected disconnects or reloads.</li>
            </ul>
          </div>

          {/* 2. Marking Scheme */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>2. Marking Scheme & Negative Marking</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-800 block text-xs">Correct Response</span>
                <span className="text-base font-black text-emerald-700 font-mono">+1.00 Marks</span>
                <p className="text-[11px] text-emerald-600 mt-0.5">Awarded for each correct answer choice.</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="font-bold text-rose-800 block text-xs">Incorrect Response</span>
                <span className="text-base font-black text-rose-700 font-mono">−0.25 Marks</span>
                <p className="text-[11px] text-rose-600 mt-0.5">Deducted for every wrong answer choice.</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              * Unanswered / skipped questions carry 0.00 marks (no penalty deduction).
            </p>
          </div>

          {/* 3. Question Palette Colors */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>3. Question Palette Status Guide (5 Official States)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                <div>
                  <span className="font-bold text-slate-900 block">Green — Answered</span>
                  <span className="text-[10px] text-emerald-700">Evaluated for final score</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                <div>
                  <span className="font-bold text-slate-900 block">Red — Not Answered</span>
                  <span className="text-[10px] text-slate-500">Visited but answer not saved</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                <div>
                  <span className="font-bold text-slate-900 block">Grey — Not Visited</span>
                  <span className="text-[10px] text-slate-500">Question not yet viewed</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">4</span>
                <div>
                  <span className="font-bold text-slate-900 block">Purple — Marked for Review</span>
                  <span className="text-[10px] text-purple-700">Unanswered, marked for review</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                <span className="w-6 h-6 rounded-md bg-purple-900 text-white font-bold flex items-center justify-center text-[11px] shrink-0 relative">
                  5
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">Purple + Green Dot — Answered & Marked</span>
                  <span className="text-[10px] text-emerald-700">Option saved and will be evaluated for final score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Timer continues running during instruction review</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs"
          >
            <span>Resume Examination</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
