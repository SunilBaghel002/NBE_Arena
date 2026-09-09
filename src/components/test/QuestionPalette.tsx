"use client";

import React from "react";
import { useTestStore } from "@/store/testStore";
import { SectionType, QuestionStatus } from "@/types";
import { useSession } from "next-auth/react";
import {
  LayoutGrid,
  User,
  FileText,
  HelpCircle,
  Send,
  Monitor,
} from "lucide-react";

interface QuestionPaletteProps {
  onOpenInstructions?: () => void;
  onOpenQuestionPaper?: () => void;
  onSubmitClick?: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  onOpenInstructions,
  onOpenQuestionPaper,
  onSubmitClick,
}) => {
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

  const getButtonStyles = (status: QuestionStatus, isCurrent: boolean) => {
    let base =
      "w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition shadow-2xs relative font-mono select-none ";

    if (isCurrent) {
      base += "ring-3 ring-blue-600 ring-offset-2 ring-offset-white font-black scale-105 shadow-md z-10 ";
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
    <div className="bg-white rounded-3xl shadow-card border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between min-h-[calc(100vh-175px)] overflow-hidden">
      {/* 1. Candidate Info Card (Official CBT Hall Console Header) */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0 font-mono">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="font-black text-xs text-slate-900 truncate block leading-tight">
              {candidateName}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">
              Roll No: NBEMS-2024-JA
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Console ID
          </span>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            NODE-28
          </span>
        </div>
      </div>

      {/* 2. Section Quick Switcher & Header */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" /> Question Palette
          </h3>
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
            {sectionQuestions.length} Questions
          </span>
        </div>

        {/* Mini Section Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl mb-3 text-center flex-shrink-0">
          {sectionsList.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => changeSection(sec)}
              className={`py-1.5 rounded-xl text-xs font-bold transition ${
                currentSection === sec
                  ? "bg-white text-blue-600 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {sectionShortNames[sec]}
            </button>
          ))}
        </div>

        {/* 5-Column Scrollable Question Palette Grid */}
        <div className="flex-1 overflow-y-auto pr-1 pb-2">
          <div className="grid grid-cols-5 gap-2">
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
      </div>

      {/* 3. Official CBT 5-State Legend & Live Counters */}
      <div className="pt-3 border-t border-slate-200 space-y-3 flex-shrink-0">
        {/* 5 States Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 flex-shrink-0" />
            <span>Answered ({totalAnswered})</span>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 flex-shrink-0" />
            <span>Not Answered ({totalUnanswered})</span>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200 flex-shrink-0" />
            <span>Not Visited ({totalNotVisited})</span>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-600 flex-shrink-0" />
            <span>Marked Review ({totalMarked})</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 p-1 rounded-lg bg-purple-50/50 border border-purple-100 text-[10px] text-purple-900">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-900 flex-shrink-0 relative">
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </span>
            <span>Answered & Marked ({totalAnsweredMarked}) — will be evaluated</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1.5 font-mono">
            <span>Overall Paper Progress</span>
            <span className="text-blue-700">{totalCompleted} / 200 ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
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

        {/* Palette Bottom Quick Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onOpenQuestionPaper && (
            <button
              type="button"
              onClick={onOpenQuestionPaper}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Paper View</span>
            </button>
          )}

          {onOpenInstructions && (
            <button
              type="button"
              onClick={onOpenInstructions}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Instructions</span>
            </button>
          )}

          {onSubmitClick && (
            <button
              type="button"
              onClick={onSubmitClick}
              className="col-span-2 py-2.5 px-3 rounded-xl bg-exam-danger hover:bg-rose-700 text-white text-xs font-black transition shadow-xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Examination</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
