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

  // A picture-only question has no stem sentence — the extractor stores the
  // placeholder "[figure]" so the field stays required. Never show it verbatim.
  const stemIsFigureOnly = question.stemIsFigureOnly || question.questionText === "[figure]";
  const optionFigures = question.optionImages;
  const hasOptionFigures = optionKeys.some((k) => optionFigures?.[k]);
  const figureLabel =
    question.figureKind === "table"
      ? "Table"
      : question.figureKind === "chart"
        ? "Graph / Chart"
        : "Figure / Question Diagram";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-exam-border flex flex-col justify-between h-[calc(100vh-135px)] overflow-hidden">
      {/* 1. Fixed Question Subheader */}
      <div className="flex-shrink-0 p-4 sm:p-4.5 border-b border-exam-border flex items-center justify-between bg-slate-50/90 select-none">
        <div className="flex items-center space-x-2.5">
          <span className="bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-md shadow-xs tracking-wide">
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

      {/* 2. Scrollable Question Content & Options Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Question Text (17px / 1.65 line height for effortless readability) */}
        {!stemIsFigureOnly && (
          <div className="text-[17px] sm:text-[18px] text-slate-900 font-medium leading-[1.65] whitespace-pre-line tracking-tight select-text">
            {question.questionText}
          </div>
        )}

        {/* Question Figure / Diagram / Match Table */}
        {question.imagePath ? (
          <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
            <img
              src={question.imagePath}
              alt={figureLabel}
              // Match tables and bar graphs are tall; the body scrolls, so give
              // them the room to stay legible instead of shrinking them to fit.
              className="max-h-[26rem] w-auto object-contain rounded-xl shadow-xs bg-white p-2"
              loading="eager"
            />
            <span className="text-[11px] text-slate-500 font-semibold mt-2">{figureLabel}</span>
          </div>
        ) : question.hasImage && !hasOptionFigures ? (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center text-xs text-blue-900 flex flex-col items-center justify-center gap-1.5">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <p className="font-bold text-slate-800">Visual / Diagram Question</p>
            <p className="text-[11px] text-slate-500">Pattern & non-verbal reasoning</p>
          </div>
        ) : null}

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {optionKeys.map((key, index) => {
            const optText = question.options[key];
            const optImage = optionFigures?.[key] || "";
            if (!optText && !optImage) return null;

            const isSelected = selectedOption === key;
            // Figure options store their URL in `optionImages`; older records put
            // it straight into the text field, so honour both shapes.
            const imageSrc =
              optImage ||
              (optText.startsWith("http://") || optText.startsWith("https://") || optText.startsWith("/uploads/")
                ? optText
                : "");

            return (
              <label
                key={key}
                onClick={() => selectOption(key)}
                className={`flex items-start space-x-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-slate-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-400 bg-white"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Option Identifier and Text / Image */}
                <div className="flex-1 flex items-start gap-2.5">
                  <span
                    className={`font-black text-sm uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {key.toUpperCase()}
                  </span>
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={`Option ${key.toUpperCase()}`}
                      className="max-h-32 w-auto object-contain rounded-lg border border-slate-200 bg-white p-1"
                    />
                  ) : (
                    <span className="text-[15px] sm:text-[16px] leading-relaxed pt-0.5">
                      {optText}
                    </span>
                  )}
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

      {/* 3. Fixed / Sticky Footer Controls on Bottom */}
      <div className="flex-shrink-0 p-4 sm:p-4.5 border-t border-exam-border bg-slate-50/95 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Left Actions: Previous & Clear */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={prevQuestion}
            className="flex items-center space-x-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition active:scale-98 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous [P]</span>
          </button>

          <button
            type="button"
            onClick={clearResponse}
            disabled={!selectedOption}
            className="flex items-center space-x-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
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
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold transition shadow-sm active:scale-98"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Mark for Review [M]</span>
          </button>

          <button
            type="button"
            onClick={saveAndNext}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition shadow-md hover:shadow-lg active:scale-98"
          >
            <span>Save & Next [N]</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
