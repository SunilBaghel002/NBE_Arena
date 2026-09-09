"use client";

import React from "react";
import { useTestStore } from "@/store/testStore";
import { SectionType, QuestionStatus } from "@/types";
import { useSession } from "next-auth/react";
import { LayoutGrid } from "lucide-react";

interface QuestionPaletteProps {
  onQuestionSelected?: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ onQuestionSelected }) => {
  const { data: session } = useSession();
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

  // Compact question buttons (User requested: "make these question buttons like 1, 2, 3, 4 a little bit smaller")
  const getButtonStyles = (status: QuestionStatus, isCurrent: boolean) => {
    let base =
      "w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg font-bold text-[11px] flex items-center justify-center transition shadow-2xs relative font-mono select-none ";

    if (isCurrent) {
      base += "ring-2 ring-blue-600 ring-offset-1 ring-offset-white font-black scale-105 shadow-xs z-10 ";
    }

    switch (status) {
      case "answered":
        return base + "bg-emerald-600 text-white hover:bg-emerald-700";
      case "marked":
        return base + "bg-purple-600 text-white hover:bg-purple-700";
      case "answered_marked":
        return base + "bg-purple-900 text-white hover:bg-purple-950";
      case "unanswered":
        return base + "bg-rose-500 text-white hover:bg-rose-600";
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

  const candidateName = session?.user?.name || "Candidate";
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CA";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-card border border-slate-200/90 p-3 sm:p-4 flex flex-col justify-between h-full min-h-0 overflow-hidden select-none">
      {/* 1. Candidate Info Card (Compact CBT Hall Header) */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-2 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0 font-mono">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs text-slate-900 truncate block leading-tight">
              {candidateName}
            </span>
            <span className="text-[9.5px] text-slate-500 font-mono block">
              Roll: NBEMS-2024-JA
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Console
          </span>
          <span className="text-[10.5px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            NODE-28
          </span>
        </div>
      </div>

      {/* 2. Section Quick Switcher & Palette Header */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" /> Question Palette
          </h3>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
            {sectionQuestions.length} Questions
          </span>
        </div>

        {/* Mini Section Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-xl mb-2 text-center flex-shrink-0">
          {sectionsList.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => changeSection(sec)}
              className={`py-1 rounded-lg text-[10.5px] font-bold transition ${
                currentSection === sec
                  ? "bg-white text-blue-600 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {sectionShortNames[sec]}
            </button>
          ))}
        </div>

        {/* 5-Column Question Palette Grid (Compact sizing, scrollable internally if needed) */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-1">
          <div className="grid grid-cols-5 gap-1.5 place-items-center">
            {sectionQuestions.map((qId, index) => {
              const ans = answers[qId];
              const status = ans?.status || "not_visited";
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={qId}
                  type="button"
                  onClick={() => {
                    jumpToQuestion(currentSection, index);
                    onQuestionSelected?.();
                  }}
                  aria-label={`Question ${index + 1}, ${status}`}
                  className={getButtonStyles(status, isCurrent)}
                >
                  {index + 1}
                  {status === "answered_marked" && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Official CBT 5-State Legend & Progress Bar (Compact fitting in 100vh) */}
      <div className="pt-2 border-t border-slate-200 space-y-2 flex-shrink-0">
        {/* 5 States Grid */}
        <div className="grid grid-cols-2 gap-1 text-[10.5px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5 p-0.5 rounded">
            <span className="w-3 h-3 rounded bg-emerald-600 flex-shrink-0" />
            <span>Answered ({totalAnswered})</span>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 rounded">
            <span className="w-3 h-3 rounded bg-rose-500 flex-shrink-0" />
            <span>Not Ans. ({totalUnanswered})</span>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 rounded">
            <span className="w-3 h-3 rounded bg-slate-200 flex-shrink-0" />
            <span>Not Visited ({totalNotVisited})</span>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 rounded">
            <span className="w-3 h-3 rounded bg-purple-600 flex-shrink-0" />
            <span>Marked ({totalMarked})</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 p-1 rounded-lg bg-purple-50/70 border border-purple-100 text-[10px] text-purple-900 font-semibold">
            <span className="w-3 h-3 rounded bg-purple-900 flex-shrink-0 relative">
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </span>
            <span>Answered & Marked ({totalAnsweredMarked}) · Evaluated</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1 font-mono">
            <span>Overall Paper Progress</span>
            <span className="text-blue-700">{totalCompleted} / 200 ({progressPercent}%)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 transition-all duration-300"
              style={{ width: `${(totalAnswered / 200) * 100}%` }}
            />
            <div
              className="bg-purple-900 transition-all duration-300"
              style={{ width: `${(totalAnsweredMarked / 200) * 100}%` }}
            />
            <div
              className="bg-purple-600 transition-all duration-300"
              style={{ width: `${(totalMarked / 200) * 100}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${(totalUnanswered / 200) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
