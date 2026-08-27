"use client";

import React from "react";
import { useTestStore } from "@/store/testStore";
import { Clock, Send, Shield, AlertTriangle } from "lucide-react";
import { SectionType } from "@/types";

interface TestHeaderProps {
  onSubmitClick: () => void;
}

const SECTION_LABELS: Record<SectionType, string> = {
  REASONING: "Reasoning",
  GA: "General Awareness",
  QUANT: "Quantitative Aptitude",
  ENGLISH: "English Comprehension",
};

export const TestHeader: React.FC<TestHeaderProps> = ({ onSubmitClick }) => {
  const {
    mockTitle,
    currentSection,
    sections,
    answers,
    remainingSeconds,
    changeSection,
    isSubmitting,
  } = useTestStore();

  // Format timer as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // Timer alert thresholds per PRD/03_UI_CONTEXT.md
  const isBlinking = remainingSeconds <= 300; // <= 5 mins (flashing)
  const isDanger = remainingSeconds <= 600; // <= 10 mins (red)
  const isWarning = remainingSeconds <= 1800; // <= 30 mins (orange)

  let timerColorClass = "bg-white/10 text-white border-white/20";
  if (isDanger) {
    timerColorClass = "bg-rose-600 text-white border-rose-400 font-black animate-pulse shadow-lg";
  } else if (isWarning) {
    timerColorClass = "bg-amber-500 text-white border-amber-300 font-bold shadow-md";
  }

  // Count answered per section
  const getAnsweredCount = (section: SectionType) => {
    const ids = sections[section] || [];
    return ids.filter(
      (id) =>
        answers[id]?.status === "answered" || answers[id]?.status === "answered_marked"
    ).length;
  };

  return (
    <header className="bg-exam-primary text-white shadow-lg select-none sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-white/15">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-exam-saffron rounded-lg flex items-center justify-center font-black text-white text-base shadow tracking-wider">
            NBE
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base leading-tight truncate max-w-[180px] sm:max-w-md">
              {mockTitle || "NBE Junior Assistant CBT Mock"}
            </h1>
            <p className="text-[11px] text-white/80 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span>Official CBT Mode · 200 Questions · +1.00 / -0.25</span>
            </p>
          </div>
        </div>

        {/* Right Header Area: Timer + Submit */}
        <div className="flex items-center space-x-3">
          {/* 180-min Countdown Timer */}
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-tabular text-sm sm:text-base tracking-wider font-black shadow-sm transition-colors ${timerColorClass}`}
            aria-live="polite"
            title="Remaining Examination Time"
          >
            <Clock className={`w-4 h-4 ${isBlinking ? "animate-spin" : ""}`} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={onSubmitClick}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 bg-exam-danger hover:bg-red-700 text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Submit Test</span>
          </button>
        </div>
      </div>

      {/* Section Tabs Bar */}
      <div className="bg-exam-primaryHover px-4">
        <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-1.5 py-1.5 text-xs no-scrollbar">
          {(["REASONING", "GA", "QUANT", "ENGLISH"] as SectionType[]).map((sec) => {
            const isActive = currentSection === sec;
            const answeredCount = getAnsweredCount(sec);
            const totalSec = sections[sec]?.length || 50;

            return (
              <button
                key={sec}
                type="button"
                onClick={() => changeSection(sec)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-white text-exam-primary shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{SECTION_LABELS[sec]}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black font-tabular ${
                    isActive
                      ? "bg-exam-primary text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {answeredCount}/{totalSec}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
