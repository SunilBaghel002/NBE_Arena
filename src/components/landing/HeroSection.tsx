"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bookmark,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  ShieldCheck,
  Check,
} from "lucide-react";

interface HeroSectionProps {
  onOpenDemoModal?: (tier?: string) => void;
}

interface QuestionSample {
  section: string;
  sectionCode: string;
  qNum: number;
  paletteRange: number[];
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
}

const SAMPLE_QUESTIONS: Record<string, QuestionSample> = {
  QUANT: {
    section: "Quantitative Aptitude",
    sectionCode: "QA",
    qNum: 114,
    paletteRange: [111, 112, 113, 114, 115],
    question:
      "A shopkeeper marks an article 30% above the cost price and allows a discount of 15% on the marked price. If his net profit is ₹210, what is the cost price of the article?",
    options: [
      { id: "A", text: "₹1,800" },
      { id: "B", text: "₹2,000" },
      { id: "C", text: "₹2,150" },
      { id: "D", text: "₹2,400" },
    ],
    correctId: "B",
  },
  REASONING: {
    section: "General Intelligence & Reasoning",
    sectionCode: "GI",
    qNum: 14,
    paletteRange: [11, 12, 13, 14, 15],
    question:
      "Select the option that is related to the third term in the same way as the second term is related to the first term:\n\nSOLAR : UNNCS :: LUNAR : ?",
    options: [
      { id: "A", text: "NWPBT" },
      { id: "B", text: "NWPBS" },
      { id: "C", text: "MXPBS" },
      { id: "D", text: "NVPCS" },
    ],
    correctId: "B",
  },
  GA: {
    section: "General Awareness",
    sectionCode: "GA",
    qNum: 62,
    paletteRange: [60, 61, 62, 63, 64],
    question:
      "The National Board of Examinations in Medical Sciences (NBEMS) is an autonomous body established under which Union Ministry of India?",
    options: [
      { id: "A", text: "Ministry of Education" },
      { id: "B", text: "Ministry of Health and Family Welfare" },
      { id: "C", text: "Ministry of Science and Technology" },
      { id: "D", text: "Ministry of Personnel, Public Grievances" },
    ],
    correctId: "B",
  },
  ENGLISH: {
    section: "English Comprehension",
    sectionCode: "EN",
    qNum: 178,
    paletteRange: [176, 177, 178, 179, 180],
    question:
      "Select the most appropriate SYNONYM of the given word:\n\nMETICULOUS",
    options: [
      { id: "A", text: "Negligent" },
      { id: "B", text: "Scrupulous" },
      { id: "C", text: "Hasty" },
      { id: "D", text: "Superficial" },
    ],
    correctId: "B",
  },
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDemoModal }) => {
  const [activeSec, setActiveSec] = useState<"QUANT" | "REASONING" | "GA" | "ENGLISH">("QUANT");
  const [selectedOption, setSelectedOption] = useState<string | null>("B");
  const [isMarkedForReview, setIsMarkedForReview] = useState(false);
  
  // Dynamic question palette status map
  const [paletteStatus, setPaletteStatus] = useState<Record<number, "answered" | "unanswered" | "review">>({
    111: "answered",
    112: "answered",
    113: "review",
    114: "answered",
    115: "unanswered",
    11: "answered",
    12: "unanswered",
    13: "answered",
    14: "unanswered",
    15: "unanswered",
    60: "answered",
    61: "review",
    62: "unanswered",
    63: "unanswered",
    64: "answered",
    176: "answered",
    177: "unanswered",
    178: "unanswered",
    179: "answered",
    180: "unanswered",
  });

  // Simulated Live Countdown Timer (Ticks strictly second-by-second)
  const [timeLeft, setTimeLeft] = useState(10748); // ~02:59:08

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 10800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currQ = SAMPLE_QUESTIONS[activeSec];

  const handleSelectOption = (optId: string) => {
    setSelectedOption(optId);
    setIsMarkedForReview(false);
    setPaletteStatus((prev) => ({ ...prev, [currQ.qNum]: "answered" }));
  };

  const handleMarkForReview = () => {
    setIsMarkedForReview(true);
    setPaletteStatus((prev) => ({ ...prev, [currQ.qNum]: "review" }));
  };

  const handleClear = () => {
    setSelectedOption(null);
    setIsMarkedForReview(false);
    setPaletteStatus((prev) => ({ ...prev, [currQ.qNum]: "unanswered" }));
  };

  const handleSectionSwitch = (secKey: "QUANT" | "REASONING" | "GA" | "ENGLISH") => {
    setActiveSec(secKey);
    setSelectedOption(secKey === "QUANT" ? "B" : null);
    setIsMarkedForReview(false);
  };

  const handlePaletteClick = (qNum: number) => {
    // Toggle answered/review/unanswered on click for instant interactive feedback
    setPaletteStatus((prev) => {
      const current = prev[qNum] || "unanswered";
      const next = current === "unanswered" ? "answered" : current === "answered" ? "review" : "unanswered";
      return { ...prev, [qNum]: next };
    });
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 border-b border-slate-200/80">
      {/* Ambient background soft light glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-1/4 w-[480px] h-[480px] bg-blue-100/60 rounded-full blur-[120px]" />
        <div className="absolute top-[60px] right-1/4 w-[420px] h-[420px] bg-amber-100/50 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* LEFT COLUMN: Open, Breathable, High-Impact Typography */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Shimmer Eyebrow Tag */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-bold text-slate-700 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-blue-700 font-extrabold uppercase tracking-wider text-[11px]">
                  CBT Examination Infrastructure
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-medium text-[11px]">1:1 TCS iON Parity</span>
              </div>
            </div>

            {/* Master Headline with Outfit Display Font & Breathable Leading */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Train in the Exact CBT Hall{" "}
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                Before Your Exam Day.
              </span>
            </h1>

            {/* Subtitle - Open, Comfortable Reading Line-Height */}
            <p className="text-base sm:text-lg lg:text-[19px] text-slate-600 font-normal leading-[1.68] max-w-xl mx-auto lg:mx-0">
              The authentic computer-based testing platform for NBEMS Junior Assistant, SSC, and
              state exam academies. Practice with exact 180-minute countdowns, −0.25 negative
              marking physics, and automated AI diagnostics that identify weak spots.
            </p>

            {/* High-Converting Action CTAs with Generous Sizing */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/book-demo?plan=SaaS+Pro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition transform active:scale-95 group"
                id="hero-book-demo-btn"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Book Institute Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-7 py-4 rounded-2xl border border-slate-300/90 shadow-xs transition hover:border-slate-400"
              >
                <span>Candidate Portal</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Structured Pill Badges with Generous Top Margin */}
            <div className="pt-7 mt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>200 MCQs / 180 Min</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>−0.25 Penalty Physics</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>150 Qualifying Target</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Zero-Entry Vision AI</span>
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Highly Interactive Live CBT Cockpit Simulator */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 via-indigo-200 to-amber-200 rounded-3xl blur-xl opacity-60 pointer-events-none" />

            <div className="relative rounded-2xl bg-white border border-slate-300 shadow-2xl overflow-hidden text-slate-900">
              {/* Window Bar with Live Ticking Stopwatch */}
              <div className="bg-slate-100/95 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[11px] font-bold text-slate-700">
                    Live CBT Hall Cockpit · Interactive Demo
                  </span>
                </div>

                {/* Real-time Ticking Monospace Timer */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-400 font-bold tabular-nums shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* Section Tabs Switcher */}
              <div className="bg-slate-50 border-b border-slate-200 p-1.5 grid grid-cols-4 gap-1 text-[10px] font-bold">
                {[
                  { key: "QUANT", label: "Quant" },
                  { key: "REASONING", label: "Reasoning" },
                  { key: "GA", label: "General Aw." },
                  { key: "ENGLISH", label: "English" },
                ].map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => handleSectionSwitch(sec.key as typeof activeSec)}
                    className={`py-1.5 px-1 rounded-lg text-center transition truncate cursor-pointer ${
                      activeSec === sec.key
                        ? "bg-blue-600 text-white shadow-xs font-black"
                        : "text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Question Body */}
              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Question Header */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-700">
                    Question {currQ.qNum} of 200 ({currQ.sectionCode})
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    +1.00 / −0.25 Marks
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line min-h-[44px]">
                  {currQ.question}
                </p>

                {/* Interactive Options - Highly Clickable */}
                <div className="space-y-2 pt-1">
                  {currQ.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? "bg-blue-50/95 border-blue-500 text-blue-950 shadow-xs ring-2 ring-blue-400/50"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons & Live Clickable Palette Status */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleMarkForReview}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        isMarkedForReview
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                      }`}
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>Review</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Dynamic Clickable Palette Matrix */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:inline">Palette:</span>
                    {currQ.paletteRange.map((num) => {
                      const st = paletteStatus[num] || "unanswered";
                      let bg = "bg-rose-500 text-white";
                      if (st === "answered") bg = "bg-emerald-500 text-white";
                      if (st === "review") bg = "bg-purple-600 text-white";
                      const isCurrent = num === currQ.qNum;

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePaletteClick(num)}
                          title={`Question ${num} (${st}) - Click to toggle state`}
                          className={`w-6 h-6 rounded text-[10px] font-mono font-bold flex items-center justify-center transition cursor-pointer shadow-2xs hover:scale-110 ${bg} ${
                            isCurrent ? "ring-2 ring-blue-600 ring-offset-1 font-black scale-105" : ""
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Feedback Banner */}
                {selectedOption ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold">Option ({selectedOption}) Saved to Palette</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">+1.00 Net Mark</span>
                  </div>
                ) : isMarkedForReview ? (
                  <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span className="font-bold">Marked for Review in Final Palette</span>
                    </div>
                    <span className="font-mono font-bold text-purple-700">Flagged</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 text-[11px] flex items-center justify-between">
                    <span>Click any option or palette number to test live scoring.</span>
                    <span className="font-mono text-slate-400">0.00 Net Mark</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
