"use client";

import React, { useState, useEffect } from "react";
import { useTestStore } from "@/store/testStore";
import { BrandLogo } from "@/components/BrandLogo";
import { Clock, Send, Shield, Maximize2, Minimize2, CheckCircle2 } from "lucide-react";
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

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Format timer as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // Timer alert thresholds
  const isBlinking = remainingSeconds <= 300; // <= 5 mins (flashing)
  const isDanger = remainingSeconds <= 600; // <= 10 mins (red)
  const isWarning = remainingSeconds <= 1800; // <= 30 mins (orange)

  let timerColorClass = "bg-slate-900 text-slate-200 border-slate-800";
  if (isDanger) {
    timerColorClass = "bg-rose-600 text-white border-rose-400 font-black animate-pulse shadow-lg";
  } else if (isWarning) {
    timerColorClass = "bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md";
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
    <header className="bg-slate-950 text-white shadow-xl select-none sticky top-0 z-30 border-b border-slate-800/80">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center space-x-4">
          <BrandLogo size="sm" showSubtitle={false} />
          <div className="border-l border-slate-800 pl-4 hidden sm:block">
            <h1 className="font-extrabold text-xs sm:text-sm text-slate-200 leading-tight truncate max-w-[200px] sm:max-w-md">
              {mockTitle || "NBE Junior Assistant CBT Mock"}
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="text-slate-400 font-medium">200 Qs · 180 Mins · +1.00 / −0.25</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto-saved
              </span>
            </p>
          </div>
        </div>

        {/* Right Header Area: Fullscreen + Timer + Submit */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-800"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen CBT Exam Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

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
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black px-4 py-2 rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Submit Test</span>
          </button>
        </div>
      </div>

      {/* Section Tabs Bar */}
      <div className="bg-slate-900/90 px-4">
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
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-black"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{SECTION_LABELS[sec]}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black font-tabular ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "bg-slate-800 text-slate-300"
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
