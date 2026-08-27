"use client";

import React, { useEffect } from "react";
import { useTestStore } from "@/store/testStore";
import { OptionKey } from "@/types";
import { ChevronLeft, ChevronRight, BookmarkCheck, RotateCcw, Image as ImageIcon } from "lucide-react";

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
    nextQuestion,
  } = useTestStore();

  const currentQId = sections[currentSection]?.[currentIndex];
  const question = currentQId ? questions[currentQId] : null;
  const currentAnswer = currentQId ? answers[currentQId] : null;
  const selectedOption = currentAnswer?.selectedOption || null;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
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
      <div className="bg-white rounded-xl shadow-sm border border-exam-border p-12 text-center text-exam-muted">
        Loading question...
      </div>
    );
  }

  const optionKeys: OptionKey[] = ["a", "b", "c", "d"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-exam-border flex flex-col justify-between min-h-[560px]">
      {/* Question Header */}
      <div className="p-4 sm:p-5 border-b border-exam-border flex items-center justify-between bg-slate-50/70 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <span className="bg-exam-primary text-white text-xs font-bold px-2.5 py-1 rounded">
            Q. {currentIndex + 1}
          </span>
          <span className="text-xs text-exam-muted font-semibold uppercase tracking-wider">
            {currentSection} SECTION · 50 Questions
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
            +1.00
          </span>
          <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
            -0.25
          </span>
        </div>
      </div>

      {/* Question Content & Options Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-start">
        {/* Question Text */}
        <div className="text-base sm:text-lg text-exam-text font-medium leading-relaxed mb-6 whitespace-pre-line">
          {question.questionText}
        </div>

        {/* Optional Question Image */}
        {question.hasImage && (
          <div className="mb-6 p-4 rounded-lg bg-slate-100 border border-slate-300 text-center text-xs text-slate-600 flex flex-col items-center justify-center gap-1.5">
            <ImageIcon className="w-6 h-6 text-slate-400" />
            <p className="font-semibold">Figure / Diagram Question</p>
            <p className="text-[11px] text-slate-500">Refer to original diagram or question stem.</p>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 mt-2">
          {optionKeys.map((key, index) => {
            const optText = question.options[key];
            if (!optText) return null;

            const isSelected = selectedOption === key;

            return (
              <label
                key={key}
                onClick={() => selectOption(key)}
                className={`flex items-start space-x-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "border-exam-primary bg-blue-50/70 text-exam-text shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
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
                <div className="flex-1 flex items-start gap-2">
                  <span className="font-bold text-sm text-slate-900 uppercase">
                    ({key})
                  </span>
                  <span className="text-sm sm:text-base leading-snug">{optText}</span>
                </div>

                {/* Key hint badge */}
                <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono border border-slate-200 px-1.5 py-0.5 rounded">
                  Key {index + 1}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-5 border-t border-exam-border bg-slate-50/70 rounded-b-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Navigation */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={prevQuestion}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={clearResponse}
            disabled={!selectedOption}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right Side: Mark for Review & Save Next */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={markForReview}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-exam-purple hover:bg-purple-800 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Mark for Review</span>
          </button>

          <button
            type="button"
            onClick={saveAndNext}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-exam-success hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <span>Save & Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
