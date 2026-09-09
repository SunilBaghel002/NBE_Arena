"use client";

import React, { useState } from "react";
import { useTestStore } from "@/store/testStore";
import { SectionType } from "@/types";
import { X, FileText, CheckCircle2, ArrowRight } from "lucide-react";

interface QuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_TITLES: Record<SectionType, string> = {
  REASONING: "General Intelligence & Reasoning",
  GA: "General Awareness",
  QUANT: "Quantitative Aptitude",
  ENGLISH: "English Comprehension",
};

export const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({ isOpen, onClose }) => {
  const {
    currentSection,
    sections,
    questions,
    answers,
    jumpToQuestion,
    changeSection,
  } = useTestStore();

  const [activeTab, setActiveTab] = useState<SectionType>(currentSection);

  if (!isOpen) return null;

  const sectionQuestions = sections[activeTab] || [];

  const handleJump = (index: number) => {
    changeSection(activeTab);
    jumpToQuestion(activeTab, index);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Question Paper Overview
              </h3>
              <p className="text-xs text-slate-500">
                View all 50 questions for each section. Click any question to navigate directly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200 transition"
            title="Close Question Paper"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto p-2 bg-slate-100 border-b border-slate-200 gap-1.5 flex-shrink-0 text-xs font-bold">
          {(["REASONING", "GA", "QUANT", "ENGLISH"] as SectionType[]).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveTab(sec)}
              className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === sec
                  ? "bg-white text-blue-600 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{SECTION_TITLES[sec]}</span>
              <span className="ml-1.5 text-[10px] text-slate-400">({sections[sec]?.length || 50} Qs)</span>
            </button>
          ))}
        </div>

        {/* Question List Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 divide-y divide-slate-100">
          {sectionQuestions.map((qId, idx) => {
            const q = questions[qId];
            const ans = answers[qId];
            const status = ans?.status || "not_visited";

            let statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Not Visited
              </span>
            );

            if (status === "answered") {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Answered ({ans.selectedOption?.toUpperCase()})
                </span>
              );
            } else if (status === "unanswered") {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Not Answered
                </span>
              );
            } else if (status === "marked") {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Marked for Review
                </span>
              );
            } else if (status === "answered_marked") {
              statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                  Answered & Marked ({ans.selectedOption?.toUpperCase()})
                </span>
              );
            }

            return (
              <div
                key={qId}
                onClick={() => handleJump(idx)}
                className="pt-3.5 first:pt-0 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 p-2.5 rounded-2xl transition group"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs flex items-center justify-center text-slate-700 shrink-0 transition font-mono mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1 flex-1">
                    <p className="text-xs sm:text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed">
                      {q?.questionText || "Question stem content"}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>Section: {SECTION_TITLES[activeTab]}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-bold">+1.00</span>
                      <span>/</span>
                      <span className="text-rose-700 font-bold">-0.25</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge}
                  <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition hidden sm:inline-flex items-center gap-1">
                    Solve <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Click on any question row to jump directly to it</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition shadow-xs"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
