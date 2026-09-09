"use client";

import React, { useState, useEffect } from "react";
import { useTestStore } from "@/store/testStore";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Clock,
  Send,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { SectionType } from "@/types";

interface TestHeaderProps {
  onSubmitClick: () => void;
  onInstructionsClick?: () => void;
  onQuestionPaperClick?: () => void;
}

const SECTION_LABELS: Record<SectionType, string> = {
  REASONING: "General Intelligence & Reasoning",
  GA: "General Awareness",
  QUANT: "Quantitative Aptitude",
  ENGLISH: "English Comprehension",
};

export const TestHeader: React.FC<TestHeaderProps> = ({
  onSubmitClick,
  onInstructionsClick,
  onQuestionPaperClick,
}) => {
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
  const isDanger = remainingSeconds <= 600; // <= 10 mins (red)
  const isWarning = remainingSeconds <= 1800; // <= 30 mins (amber)

  let timerStyles = "bg-slate-50 text-slate-800 border-slate-200/90";
  if (isDanger) {
    timerStyles = "bg-rose-50 text-rose-700 border-rose-300 font-black animate-pulse shadow-xs";
  } else if (isWarning) {
    timerStyles = "bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-xs";
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
    <header className="bg-white/95 backdrop-blur-md text-slate-900 shadow-xs select-none sticky top-0 z-30 border-b border-slate-200">
      {/* Top Universal Exam Header Banner */}
      <div className="max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between border-b border-slate-100 gap-3">
        {/* Left: Brand + Examination Specs */}
        <div className="flex items-center space-x-3.5">
          <BrandLogo size="sm" showSubtitle={false} theme="light" />
          <div className="border-l border-slate-200 pl-3.5 hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 leading-tight truncate max-w-[220px] sm:max-w-md">
                {mockTitle || "NBE Junior Assistant Full CBT Mock"}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                CBT Hall
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
              <span>200 Questions · 180 Mins · +1.00 / −0.25 Marking</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto-saved
              </span>
            </p>
          </div>
        </div>

        {/* Right: Tools + Timer + Submit CTA */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Question Paper Overview Modal CTA */}
          {onQuestionPaperClick && (
            <button
              type="button"
              onClick={onQuestionPaperClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition shadow-2xs"
              title="View Complete Question Paper"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Question Paper</span>
            </button>
          )}

          {/* Official Instructions Modal CTA */}
          {onInstructionsClick && (
            <button
              type="button"
              onClick={onInstructionsClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition shadow-2xs"
              title="Review Examination Instructions"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Instructions</span>
            </button>
          )}

          {/* Fullscreen Mode Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition border border-slate-200 shadow-2xs"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Distraction-Free Fullscreen CBT Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Official Countdown Timer Pill */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold shadow-2xs transition-colors select-none ${timerStyles}`}
            aria-live="polite"
            title="Remaining Examination Countdown Timer"
          >
            <Clock className={`w-3.5 h-3.5 ${isDanger ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-500"}`} />
            <div className="flex flex-col text-left">
              <span className="text-[8.5px] font-sans uppercase font-bold text-slate-400 leading-none">Time Left</span>
              <span className="tracking-wider text-xs sm:text-sm">{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Submit Test CTA Button */}
          <button
            type="button"
            onClick={onSubmitClick}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 bg-exam-danger hover:bg-rose-700 text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-xs transition transform active:scale-98 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Submit Test</span>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs Bar (Clean Light SaaS Theme) */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1700px] w-full mx-auto flex overflow-x-auto space-x-2 py-2 text-xs no-scrollbar">
          {(["REASONING", "GA", "QUANT", "ENGLISH"] as SectionType[]).map((sec, idx) => {
            const isActive = currentSection === sec;
            const answeredCount = getAnsweredCount(sec);
            const totalSec = sections[sec]?.length || 50;

            return (
              <button
                key={sec}
                type="button"
                onClick={() => changeSection(sec)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap select-none ${
                  isActive
                    ? "bg-exam-primary text-white shadow-xs font-black"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-[11px] text-slate-400 font-mono">Sec {idx + 1}:</span>
                <span>{SECTION_LABELS[sec]}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
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
