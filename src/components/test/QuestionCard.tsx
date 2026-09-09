"use client";

import React, { useEffect, useState } from "react";
import { useTestStore } from "@/store/testStore";
import { OptionKey } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  RotateCcw,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";

interface QuestionCardProps {
  onPaletteClick?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ onPaletteClick }) => {
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

  // Industry Feature: Font Size Zoom Controller (100%, 115%, 130%)
  const [fontSize, setFontSize] = useState<"normal" | "medium" | "large">("normal");

  const currentQId = sections[currentSection]?.[currentIndex];
  const question = currentQId ? questions[currentQId] : null;
  const currentAnswer = currentQId ? answers[currentQId] : null;
  const selectedOption = currentAnswer?.selectedOption || null;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "1") selectOption("a");
      if (e.key === "2") selectOption("b");
      if (e.key === "3") selectOption("c");
      if (e.key === "4") selectOption("d");
      if (e.key === "n" || e.key === "N") saveAndNext();
      if (e.key === "p" || e.key === "P") prevQuestion();
      if (e.key === "m" || e.key === "M") markForReview();
      if (e.key === "c" || e.key === "C") clearResponse();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectOption, saveAndNext, prevQuestion, markForReview, clearResponse]);

  if (!question) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-slate-200 p-8 text-center text-slate-400 h-full flex items-center justify-center">
        Loading question stem...
      </div>
    );
  }

  const optionKeys: OptionKey[] = ["a", "b", "c", "d"];

  const stemIsFigureOnly = question.stemIsFigureOnly || question.questionText === "[figure]";
  const optionFigures = question.optionImages;
  const hasOptionFigures = optionKeys.some((k) => optionFigures?.[k]);
  const figureLabel =
    question.figureKind === "table"
      ? "Table"
      : question.figureKind === "chart"
        ? "Graph / Chart"
        : "Figure / Question Diagram";

  // Dynamic font sizing classes (Tuned for mobile so text fits comfortably without scrolling)
  const fontStyles = {
    normal: "text-[14px] sm:text-[16px] leading-[1.45] sm:leading-[1.6]",
    medium: "text-[16px] sm:text-[18px] leading-[1.5] sm:leading-[1.65]",
    large: "text-[18px] sm:text-[20px] leading-[1.55] sm:leading-[1.7]",
  }[fontSize];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-slate-200/90 flex flex-col justify-between h-full min-h-0 overflow-hidden select-none">
      {/* 1. Official Industry Utility Toolbar */}
      <div className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between gap-2 select-none">
        {/* Left: Question Number + Section Breadcrumb + Type */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="bg-slate-900 text-white text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-lg shadow-2xs font-mono">
            Q.{currentIndex + 1}
          </span>
          <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">
            <span className="hidden sm:inline">{currentSection} · Question {currentIndex + 1} of 50</span>
            <span className="sm:hidden">{currentSection} ({currentIndex + 1}/50)</span>
          </span>
          <span className="hidden md:inline-block text-[10px] uppercase font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
            MCQ Single Choice
          </span>
        </div>

        {/* Right: Marks Badges + Font Zoom + Mobile Palette Trigger */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Marks Badges */}
          <div className="flex items-center gap-1 font-mono font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] sm:text-[11px]">
              +1.00
            </span>
            <span className="text-rose-700 bg-rose-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-rose-200 text-[10px] sm:text-[11px]">
              -0.25
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-300 hidden sm:block" />

          {/* Text Zoom / Font Size (A / A+ / A++) */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => setFontSize("normal")}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] transition ${
                fontSize === "normal" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Standard Font Size (100%)"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("medium")}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] transition ${
                fontSize === "medium" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Medium Font Size (115%)"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] transition ${
                fontSize === "large" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Large Font Size (130%)"
            >
              A++
            </button>
          </div>
        </div>
      </div>

      {/* 2. Question Stem Body & Options (Fitted without inner scroll on standard viewports) */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-2.5 sm:space-y-4">
        {/* Question Text */}
        {!stemIsFigureOnly && (
          <div className={`text-slate-900 font-medium whitespace-pre-line tracking-tight select-text ${fontStyles}`}>
            {question.questionText}
          </div>
        )}

        {/* Question Figure / Diagram / Table */}
        {question.imagePath ? (
          <div className="my-1.5 sm:my-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
            <img
              src={question.imagePath}
              alt={figureLabel}
              className="max-h-[14rem] sm:max-h-[18rem] w-auto object-contain rounded-lg shadow-xs bg-white p-1.5"
              loading="eager"
            />
            <span className="text-[10px] text-slate-500 font-semibold mt-1">{figureLabel}</span>
          </div>
        ) : question.hasImage && !hasOptionFigures ? (
          <div className="p-2 sm:p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-center text-xs text-blue-900 flex flex-col items-center justify-center gap-1">
            <ImageIcon className="w-4 h-4 sm:w-5 h-5 text-blue-600" />
            <p className="font-bold text-slate-800">Visual / Diagram Question</p>
            <p className="text-[10px] text-slate-500">Pattern & non-verbal reasoning</p>
          </div>
        ) : null}

        {/* Options List (Compact padding to fit neatly without inner scroll) */}
        <div className="space-y-2 sm:space-y-2.5 pt-0.5">
          {optionKeys.map((key, index) => {
            const optText = question.options[key];
            const optImage = optionFigures?.[key] || "";
            if (!optText && !optImage) return null;

            const isSelected = selectedOption === key;
            const imageSrc =
              optImage ||
              (optText.startsWith("http://") || optText.startsWith("https://") || optText.startsWith("/uploads/")
                ? optText
                : "");

            return (
              <label
                key={key}
                onClick={() => selectOption(key)}
                className={`flex items-start space-x-2.5 sm:space-x-3 p-2.5 sm:p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-slate-900 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`mt-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? "border-blue-600 bg-blue-600" : "border-slate-400 bg-white"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                {/* Option Letter Tag + Text / Image */}
                <div className="flex-1 flex items-start gap-2 min-w-0">
                  <span
                    className={`font-black text-[11px] sm:text-xs uppercase px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {key.toUpperCase()}
                  </span>
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={`Option ${key.toUpperCase()}`}
                      className="max-h-20 sm:max-h-24 w-auto object-contain rounded-lg border border-slate-200 bg-white p-1"
                    />
                  ) : (
                    <span className={`text-[13.5px] sm:text-[15px] leading-snug sm:leading-relaxed pt-0.5 ${fontSize === "large" ? "text-[16px] sm:text-[17px]" : ""}`}>
                      {optText}
                    </span>
                  )}
                </div>

                {/* Keyboard Shortcut Hint */}
                <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono border border-slate-200 bg-slate-50 px-1 py-0.5 rounded font-semibold">
                  [{index + 1}]
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Official Control Bar (Bottom Action Controls) */}
      <div className="flex-shrink-0 p-2 sm:p-4 border-t border-slate-200/90 bg-slate-50/95 backdrop-blur-xs flex items-center justify-between gap-1.5 sm:gap-2.5 select-none">
        {/* Left Actions: Previous & Clear Response */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={prevQuestion}
            className="flex items-center space-x-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 transition active:scale-98 shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Previous [P]</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <button
            type="button"
            onClick={clearResponse}
            disabled={!selectedOption}
            className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Clear [C]</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>

        {/* Right Actions: Mark for Review & Primary Save & Next */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={markForReview}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold transition shadow-xs active:scale-98"
          >
            <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mark Review [M]</span>
            <span className="sm:hidden">Mark</span>
          </button>

          <button
            type="button"
            onClick={saveAndNext}
            className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition shadow-xs hover:shadow-sm active:scale-98"
          >
            <span className="hidden sm:inline">Save & Next [N]</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
