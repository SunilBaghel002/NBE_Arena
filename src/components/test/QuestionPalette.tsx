"use client";

import React from "react";
import { useTestStore } from "@/store/testStore";
import { SectionType, QuestionStatus } from "@/types";
import { LayoutGrid, Layers, CheckCircle2, Bookmark, HelpCircle } from "lucide-react";

export const QuestionPalette: React.FC = () => {
  const {
    currentSection,
    currentIndex,
    sections,
    answers,
    jumpToQuestion,
    changeSection,
  } = useTestStore();

  const sectionQuestions = sections[currentSection] || [];

  // Calculate overall summary stats across all 200 questions
  let totalAnswered = 0;
  let totalMarked = 0;
  let totalAnsweredMarked = 0;
  let totalUnanswered = 0;
  let totalNotVisited = 0;

  Object.values(answers).forEach((ans) => {
    switch (ans.status) {
      case "answered":
        totalAnswered++;
        break;
      case "marked":
        totalMarked++;
        break;
      case "answered_marked":
        totalAnsweredMarked++;
        break;
      case "unanswered":
        totalUnanswered++;
        break;
      case "not_visited":
      default:
        totalNotVisited++;
        break;
    }
  });

  const getButtonStyles = (status: QuestionStatus, isCurrent: boolean) => {
    let base =
      "w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition shadow-xs relative font-tabular select-none ";

    if (isCurrent) {
      base += "ring-2 ring-offset-2 ring-exam-current border-2 border-exam-primary scale-105 font-black z-10 ";
    }

    switch (status) {
      case "answered":
        return base + "bg-exam-answered text-white hover:opacity-90";
      case "marked":
        return base + "bg-exam-marked text-white hover:opacity-90";
      case "answered_marked":
        return base + "bg-exam-markedAnswered text-white hover:opacity-90";
      case "unanswered":
        return base + "bg-exam-unanswered text-white hover:opacity-90";
      case "not_visited":
      default:
        return base + "bg-slate-200 text-slate-700 hover:bg-slate-300";
    }
  };

  const sectionsList: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
  const sectionShortNames: Record<SectionType, string> = {
    REASONING: "Reasoning",
    GA: "GA",
    QUANT: "Quant",
    ENGLISH: "English",
  };

  const totalCompleted = totalAnswered + totalAnsweredMarked;
  const progressPercent = Math.round((totalCompleted / 200) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-4 sm:p-5 flex flex-col justify-between space-y-4">
      {/* Section Quick Switcher */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-exam-primary" /> Question Palette
          </h3>
          <span className="text-[11px] font-bold bg-blue-50 text-exam-primary px-2 py-0.5 rounded-full border border-blue-200">
            {sectionQuestions.length} Questions
          </span>
        </div>

        {/* Mini Section Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-center">
          {sectionsList.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => changeSection(sec)}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                currentSection === sec
                  ? "bg-white text-exam-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {sectionShortNames[sec]}
            </button>
          ))}
        </div>

        {/* 5-Column Question Palette Grid */}
        <div className="grid grid-cols-5 gap-2 max-h-[310px] overflow-y-auto pr-1 pb-2">
          {sectionQuestions.map((qId, index) => {
            const ans = answers[qId];
            const status = ans?.status || "not_visited";
            const isCurrent = index === currentIndex;

            return (
              <button
                key={qId}
                type="button"
                onClick={() => jumpToQuestion(currentSection, index)}
                aria-label={`Question ${index + 1}, ${status}`}
                className={getButtonStyles(status, isCurrent)}
              >
                {index + 1}
                {status === "answered_marked" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CBT Status Legend & Live Summary */}
      <div className="pt-3 border-t border-exam-border space-y-3">
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-exam-answered flex-shrink-0" />
            <span>Answered ({totalAnswered})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-exam-unanswered flex-shrink-0" />
            <span>Not Answered ({totalUnanswered})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-exam-marked flex-shrink-0" />
            <span>Marked ({totalMarked + totalAnsweredMarked})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200 flex-shrink-0" />
            <span>Not Visited ({totalNotVisited})</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-black text-slate-700 mb-1.5">
            <span>Overall Paper Progress</span>
            <span className="text-exam-primary font-mono">{totalCompleted} / 200 ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-exam-answered transition-all duration-300"
              style={{ width: `${(totalAnswered / 200) * 100}%` }}
            />
            <div
              className="bg-exam-marked transition-all duration-300"
              style={{ width: `${((totalMarked + totalAnsweredMarked) / 200) * 100}%` }}
            />
            <div
              className="bg-exam-unanswered transition-all duration-300"
              style={{ width: `${(totalUnanswered / 200) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
