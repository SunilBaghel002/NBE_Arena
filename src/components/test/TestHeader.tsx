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

  // Timer alert color styles
  const isBlinking = remainingSeconds <= 300; // < 5 mins
  const isDanger = remainingSeconds <= 600; // < 10 mins
  const isWarning = remainingSeconds <= 1800; // < 30 mins

  let timerColorClass = "bg-white/10 text-white border-white/20";
  if (isDanger) {
    timerColorClass = "bg-red-600/90 text-white border-red-400 animate-pulse";
  } else if (isWarning) {
    timerColorClass = "bg-amber-500/90 text-white border-amber-300";
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
    <header className="bg-exam-primary text-white shadow-md select-none sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between border-b border-white/15">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-exam-saffron rounded flex items-center justify-center font-black text-white text-sm shadow">
            NBE
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight truncate max-w-[200px] sm:max-w-md">
              {mockTitle || "NBE Junior Assistant CBT Mock"}
            </h1>
            <p className="text-[11px] text-white/75 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> Real-time CBT Examination Mode · 200 Questions
            </p>
          </div>
        </div>

        {/* Right Header Area: Timer + Submit */}
        <div className="flex items-center space-x-3">
          {/* 180-min Timer */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono font-tabular text-sm sm:text-base font-bold shadow-sm transition-colors ${timerColorClass}`}
            aria-live="polite"
          >
            <Clock className={`w-4 h-4 ${isBlinking ? "animate-spin" : ""}`} />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={onSubmitClick}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 bg-exam-danger hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg shadow transition transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      {/* Section Tabs Bar */}
      <div className="bg-exam-primaryHover px-4">
        <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-1 py-1 text-xs">
          {(["REASONING", "GA", "QUANT", "ENGLISH"] as SectionType[]).map((sec) => {
            const isActive = currentSection === sec;
            const answeredCount = getAnsweredCount(sec);
            const totalSec = sections[sec]?.length || 50;

            return (
              <button
                key={sec}
                type="button"
                onClick={() => changeSection(sec)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-white text-exam-primary shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{SECTION_LABELS[sec]}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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
