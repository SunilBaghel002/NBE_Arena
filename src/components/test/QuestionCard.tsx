"use client";

import React, { useEffect } from "react";
import { useTestStore } from "@/store/testStore";
import { OptionKey } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const QuestionCard: React.FC = () => {
  const {
    currentSection,
    currentIndex,
    sections,
    questions,
    answers,
    selectOption,
    clearResponse,
    markForReview,
    saveAndNext,
    prevQuestion,
  } = useTestStore();

  const currentQId = sections[currentSection]?.[currentIndex];
  const question = currentQId ? questions[currentQId] : null;
  const currentAnswer = currentQId ? answers[currentQId] : null;
  const selectedOption = currentAnswer?.selectedOption || null;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if candidate is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "1") selectOption("a");
      if (e.key === "2") selectOption("b");
      if (e.key === "3") selectOption("c");
      if (e.key === "4") selectOption("d");
      if (e.key === "n" || e.key === "N") saveAndNext();
      if (e.key === "p" || e.key === "P") prevQuestion();
      if (e.key === "m" || e.key === "M") markForReview();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectOption, saveAndNext, prevQuestion, markForReview]);

  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-12 text-center text-slate-400">
        Loading question stems...
      </div>
    );
  }

  const optionKeys: OptionKey[] = ["a", "b", "c", "d"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-exam-border flex flex-col justify-between min-h-[580px] overflow-hidden">
      {/* Question Top Subheader */}
      <div className="p-4 sm:p-5 border-b border-exam-border flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-2.5">
          <span className="bg-exam-primary text-white text-xs font-black px-3 py-1 rounded-md shadow-sm tracking-wide">
            Q. {currentIndex + 1}
          </span>
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">
            {currentSection} SECTION · Question {currentIndex + 1} of 50
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-black font-tabular">
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            +1.00
          </span>
          <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            -0.25
          </span>
        </div>
      </div>

      {/* Question Content & Options Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-start">
        {/* Question Text (17px / 1.6 line height for effortless readability) */}
        <div className="text-[17px] sm:text-[18px] text-slate-900 font-medium leading-[1.65] mb-6 whitespace-pre-line tracking-tight select-text">
          {question.questionText}
        </div>

        {/* Optional Figure / Diagram Placeholder */}
        {question.hasImage && (
          <div className="mb-6 p-4 rounded-xl bg-slate-100 border border-slate-300 text-center text-xs text-slate-600 flex flex-col items-center justify-center gap-1.5">
            <ImageIcon className="w-6 h-6 text-slate-400" />
            <p className="font-semibold">Figure / Diagram Question</p>
            <p className="text-[11px] text-slate-500">Refer to original diagram or question stem.</p>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 mt-1">
          {optionKeys.map((key, index) => {
            const optText = question.options[key];
            if (!optText) return null;

            const isSelected = selectedOption === key;

            return (
              <label
                key={key}
                onClick={() => selectOption(key)}
                className={`flex items-start space-x-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? "border-exam-primary bg-blue-50/70 text-slate-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-exam-primary bg-exam-primary"
                      : "border-slate-400 bg-white"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Option Identifier and Text */}
                <div className="flex-1 flex items-start gap-2.5">
                  <span
                    className={`font-black text-sm uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-exam-primary text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {key.toUpperCase()}
                  </span>
                  <span className="text-[15px] sm:text-[16px] leading-relaxed pt-0.5">
                    {optText}
                  </span>
                </div>

                {/* Key Hint Badge */}
                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono border border-slate-200 bg-slate-50 px-1.5 py-0.5 rounded font-semibold">
                  [{index + 1}]
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-5 border-t border-exam-border bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions: Previous & Clear */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={prevQuestion}
            className="flex items-center space-x-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition active:scale-98"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous [P]</span>
          </button>

          <button
            type="button"
            onClick={clearResponse}
            disabled={!selectedOption}
            className="flex items-center space-x-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right Actions: Mark for Review & Save Next */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={markForReview}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-exam-purple hover:bg-purple-800 text-white text-xs sm:text-sm font-bold transition shadow-sm active:scale-98"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Mark for Review [M]</span>
          </button>

          <button
            type="button"
            onClick={saveAndNext}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-exam-success hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition shadow-md hover:shadow-lg active:scale-98"
          >
            <span>Save & Next [N]</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
