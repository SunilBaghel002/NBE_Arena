"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AiAnalysisCard } from "@/components/AiAnalysisCard";
import { TopicWeaknessAnalysis } from "@/components/TopicWeaknessAnalysis";
import { ResultsSkeleton } from "@/components/ui/ResultsSkeleton";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
  HelpCircle,
  Sparkles,
  Grid,
  Brain,
  Calculator,
  Compass,
  BookOpen,
  ArrowDown,
  Layers,
  Maximize2,
  Minimize2,
  X,
  Filter,
} from "lucide-react";
import {
  Attempt,
  AttemptScore,
  Question,
  SectionType,
  PaletteItem,
  MockTopicAnalysis,
} from "@/types";

interface ReviewItem {
  questionId: string;
  selectedOption: "a" | "b" | "c" | "d" | null;
  status: string;
  timeSpentSeconds: number;
  question: Question | null;
  isCorrect: boolean;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [mockTitle, setMockTitle] = useState("NBE Mock Test");
  const [palette, setPalette] = useState<PaletteItem[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<MockTopicAnalysis | null>(null);

  // Palette View Controls
  const [isPaletteExpanded, setIsPaletteExpanded] = useState(false);
  const [isFullscreenMatrixOpen, setIsFullscreenMatrixOpen] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<"all" | "wrong" | "correct" | "skipped">("all");

  // Section chunking: Default to first 50 questions (Reasoning)
  const [activeSection, setActiveSection] = useState<SectionType | "ALL">("REASONING");
  const [sectionCache, setSectionCache] = useState<Record<string, ReviewItem[]>>({});
  const [filterType, setFilterType] = useState<"all" | "wrong" | "correct" | "unanswered">("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [isGeneratingMock, setIsGeneratingMock] = useState(false);

  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // Initial fetch: Palette + first 50 questions (Reasoning)
  useEffect(() => {
    async function fetchInitialResults() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/results/${attemptId}?section=REASONING`);
        if (!res.ok) {
          throw new Error("Results could not be found");
        }
        const data = await res.json();
        setAttempt(data.attempt);
        setMockTitle(data.mockTitle);
        setPalette(data.palette || []);
        setTopicAnalysis(data.topicAnalysis || null);
        if (data.questionsWithReview) {
          setSectionCache((prev) => ({ ...prev, REASONING: data.questionsWithReview }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load scorecard");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId) {
      fetchInitialResults();
    }
  }, [attemptId]);

  // Handle switching sections with instant cache lookup or targeted 50-item fetch
  const handleSelectSection = async (sec: SectionType | "ALL") => {
    setActiveSection(sec);

    if (sec === "ALL") {
      if (!sectionCache["ALL"]) {
        try {
          setSectionLoading(true);
          const res = await fetch(`/api/results/${attemptId}?section=ALL`);
          if (res.ok) {
            const data = await res.json();
            setSectionCache((prev) => ({ ...prev, ALL: data.questionsWithReview || [] }));
          }
        } finally {
          setSectionLoading(false);
        }
      }
      return;
    }

    if (!sectionCache[sec]) {
      try {
        setSectionLoading(true);
        const res = await fetch(`/api/results/${attemptId}?section=${sec}`);
        if (res.ok) {
          const data = await res.json();
          setSectionCache((prev) => ({ ...prev, [sec]: data.questionsWithReview || [] }));
        }
      } finally {
        setSectionLoading(false);
      }
    }
  };

  const handleGenerateNewMock = async () => {
    try {
      setIsGeneratingMock(true);
      const res = await fetch("/api/generate-mock", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate mock");
      }
      const data = await res.json();
      router.push(`/test/${data.mockId}/instructions`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating mock");
      setIsGeneratingMock(false);
    }
  };

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleAllExpanded = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const updated: Record<string, boolean> = {};
    currentQuestions.forEach((q) => {
      updated[q.questionId] = nextState;
    });
    setExpandedQuestions(updated);
  };

  // Jump directly to a question from the 200-question Question Navigation Palette
  const handlePaletteClick = async (pItem: PaletteItem) => {
    setIsFullscreenMatrixOpen(false);
    const targetSection = pItem.section;

    // Switch section if question is in another section
    if (activeSection !== "ALL" && activeSection !== targetSection) {
      await handleSelectSection(targetSection);
    }

    // Scroll to the card after DOM paint
    setTimeout(() => {
      const el = document.getElementById(`review-q-${pItem.questionId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setExpandedQuestions((prev) => ({ ...prev, [pItem.questionId]: true }));
      }
    }, 150);
  };

  // Jump from Topic-Wise Weakness Diagnostic Card
  const handleJumpFromTopic = async (qNumber: number, section: SectionType) => {
    if (activeSection !== "ALL" && activeSection !== section) {
      await handleSelectSection(section);
    }

    setTimeout(() => {
      const pItem = palette.find((p) => p.questionNumber === qNumber);
      if (pItem) {
        const el = document.getElementById(`review-q-${pItem.questionId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setExpandedQuestions((prev) => ({ ...prev, [pItem.questionId]: true }));
        }
      }
    }, 150);
  };

  const scrollToQuestion = (qId: string) => {
    const el = document.getElementById(`review-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setExpandedQuestions((prev) => ({ ...prev, [qId]: true }));
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
        <Navbar />
        <main className="w-full flex-1">
          <ResultsSkeleton />
        </main>
        <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
          NBE Arena — Official NBEMS Junior Assistant Examination Simulation Analytics
        </footer>
      </div>
    );
  }

  if (error || !attempt || !attempt.score) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="font-bold text-xl text-slate-800 mb-2">Scorecard Unavailable</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "Attempt record not found"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const score: AttemptScore = attempt.score;
  const isQualifying = score.qualifyingCleared;

  const sectionOrder: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
  const sectionDisplayNames: Record<SectionType, string> = {
    REASONING: "General Intelligence & Reasoning",
    GA: "General Awareness",
    QUANT: "Quantitative Aptitude",
    ENGLISH: "English Comprehension",
  };

  const sectionQuestionRanges: Record<SectionType, string> = {
    REASONING: "Qs 1–50",
    GA: "Qs 51–100",
    QUANT: "Qs 101–150",
    ENGLISH: "Qs 151–200",
  };

  const sectionIcons: Record<SectionType, React.ReactNode> = {
    REASONING: <Brain className="w-4 h-4 text-purple-600" />,
    GA: <Compass className="w-4 h-4 text-amber-600" />,
    QUANT: <Calculator className="w-4 h-4 text-blue-600" />,
    ENGLISH: <BookOpen className="w-4 h-4 text-emerald-600" />,
  };

  // Get active question list based on current active section (50 questions)
  const currentQuestions = sectionCache[activeSection] || [];

  // Filter within the current active section
  const filteredQuestions = currentQuestions.filter((item) => {
    if (filterType === "correct") return item.isCorrect;
    if (filterType === "wrong") return item.selectedOption && !item.isCorrect;
    if (filterType === "unanswered") return !item.selectedOption;
    return true;
  });

  // Calculate next section for continuation button
  const nextSectionIndex =
    activeSection !== "ALL" ? sectionOrder.indexOf(activeSection) + 1 : -1;
  const nextSection = nextSectionIndex < sectionOrder.length && nextSectionIndex > 0 ? sectionOrder[nextSectionIndex] : null;

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Universal Top Navbar */}
      <Navbar />

      {/* Main Scorecard Body */}
      <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 flex-1 space-y-8">
        {/* Score Hero Card */}
        <div className="bg-white rounded-2xl shadow-md border border-exam-border p-6 sm:p-8 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Net Score Big Counter */}
            <div className="text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Your Net Score
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl sm:text-6xl font-black text-exam-primary font-tabular tracking-tight">
                  {score.netScore}
                </span>
                <span className="text-xl font-bold text-slate-400">/ 200</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Formula: {score.correctCount} correct (+{score.rawScore}) − {score.wrongCount} wrong (−{score.negativePenalty})
              </p>
            </div>

            {/* 150 Benchmark Status */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl text-center border-2 border-dashed border-slate-200">
              {isQualifying ? (
                <div className="text-emerald-700 bg-emerald-50 w-full p-4 rounded-xl">
                  <div className="flex items-center justify-center gap-1.5 font-black text-base mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>QUALIFYING BENCHMARK CLEARED</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    Your net score {score.netScore} satisfies the 150/200 qualifying target (75%).
                  </p>
                </div>
              ) : (
                <div className="text-rose-700 bg-rose-50 w-full p-4 rounded-xl">
                  <div className="flex items-center justify-center gap-1.5 font-black text-base mb-1">
                    <Target className="w-5 h-5 text-rose-600" />
                    <span>BELOW QUALIFYING TARGET</span>
                  </div>
                  <p className="text-xs text-rose-800 font-medium">
                    Target is 150/200. You need {Number((150 - score.netScore).toFixed(2))} more net marks to qualify.
                  </p>
                </div>
              )}
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-3 font-tabular">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Accuracy</span>
                <span className="text-2xl font-black text-slate-900">{score.accuracyPercentage}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Time Taken</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatSeconds(attempt.timeTakenSeconds)}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">Correct (+1.00)</span>
                <span className="text-2xl font-black text-emerald-700">{score.correctCount}</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[11px] font-bold text-rose-700 uppercase block">Wrong (-0.25)</span>
                <span className="text-2xl font-black text-rose-700">{score.wrongCount}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-6 border-t border-exam-border flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Attempted on {new Date(attempt.submittedAt || Date.now()).toLocaleString()}
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition"
              >
                Return to Dashboard
              </Link>

              <button
                type="button"
                onClick={handleGenerateNewMock}
                disabled={isGeneratingMock}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white text-xs sm:text-sm font-black shadow-md transition disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isGeneratingMock ? "Generating..." : "Generate Another Mock"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section-Wise Breakdown Cards (Clickable to jump directly to that section) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-exam-primary" /> Section-wise Performance & Penalty Analysis
            </h2>
            <span className="text-xs text-slate-500 font-medium">Click any section card to review questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionOrder.map((secKey) => {
              const sec = score.bySection[secKey];
              if (!sec) return null;
              const isSelected = activeSection === secKey;

              return (
                <div
                  key={secKey}
                  onClick={() => {
                    handleSelectSection(secKey);
                    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`cursor-pointer rounded-xl p-5 flex flex-col justify-between transition-all transform hover:-translate-y-0.5 shadow-sm border ${
                    isSelected
                      ? "ring-2 ring-exam-primary border-exam-primary bg-blue-50/20"
                      : "bg-white border-exam-border hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-exam-primary uppercase tracking-wider flex items-center gap-1.5">
                        {sectionIcons[secKey]} {secKey}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {formatSeconds(sec.timeSpentSeconds)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-800 mb-1 truncate">
                      {sectionDisplayNames[secKey]}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 block mb-3 font-mono">
                      {sectionQuestionRanges[secKey]}
                    </span>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 font-tabular">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Section Net Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{sec.netScore}</span>
                        <span className="text-xs text-slate-500 font-bold">/ 50</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-tabular">
                    <div className="flex justify-between text-slate-600">
                      <span>Correct (+1):</span>
                      <span className="font-bold text-emerald-600">{sec.correct}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Wrong (-0.25):</span>
                      <span className="font-bold text-rose-600">{sec.wrong} (-{(sec.wrong * 0.25).toFixed(2)})</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Unanswered:</span>
                      <span className="font-bold text-slate-500">{sec.unanswered}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-100 font-semibold">
                      <span>Accuracy:</span>
                      <span className="font-bold text-slate-900">{sec.accuracyPercentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic-Wise Weakness & Mistake Diagnostic (All 4 Sections) */}
        {topicAnalysis && (
          <TopicWeaknessAnalysis
            topicAnalysis={topicAnalysis}
            onJumpToQuestion={handleJumpFromTopic}
          />
        )}

        {/* AI Mentor Diagnostic Card (On-demand with "Generate AI Report" button) */}
        <AiAnalysisCard
          attemptId={attempt.id}
          initialAnalysis={attempt.aiAnalysis}
        />

        {/* Question Navigation Palette (200 Questions Grid) */}
        <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Grid className="w-4 h-4 text-exam-primary" /> Question Navigation Palette (200 Questions)
              </h3>
              <p className="text-xs text-slate-500">
                Click any question number below to jump directly into that section and view its solution review.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Correct
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Wrong
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span> Skipped
                </span>
              </div>

              {/* View Control Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaletteExpanded(!isPaletteExpanded)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                  title="Toggle all 200 questions without internal scroll"
                >
                  {isPaletteExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" /> Compact View
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-exam-primary" /> Expand All (No Scroll)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreenMatrixOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-exam-primary hover:bg-exam-primaryHover text-white shadow-sm transition transform hover:scale-105"
                  title="Open Fullscreen 200-Question Matrix on Large Screen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen 200-Q Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* Inline Grid (Compact or Expanded) */}
          <div
            className={`grid grid-cols-10 sm:grid-cols-20 gap-1.5 p-1 transition-all ${
              isPaletteExpanded ? "" : "max-h-48 overflow-y-auto"
            }`}
          >
            {palette.map((pItem) => {
              let bg = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";
              if (pItem.isCorrect) {
                bg = "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600";
              } else if (pItem.selectedOption) {
                bg = "bg-rose-500 text-white hover:bg-rose-600 border-rose-600";
              }

              return (
                <button
                  key={pItem.questionId}
                  type="button"
                  onClick={() => handlePaletteClick(pItem)}
                  className={`h-8 rounded-lg text-xs font-bold font-tabular border flex items-center justify-center transition ${bg}`}
                  title={`Q.${pItem.questionNumber} (${pItem.section}): ${
                    pItem.topicLabel ? pItem.topicLabel + " • " : ""
                  }${pItem.isCorrect ? "Correct" : pItem.selectedOption ? "Wrong" : "Skipped"}`}
                >
                  {pItem.questionNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fullscreen 200-Question Ocean Navigation Matrix Modal */}
        {isFullscreenMatrixOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 lg:p-8 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[1700px] max-h-[96vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/90">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-exam-primary text-white shadow-md">
                    <Grid className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <span>200-Question Ocean Navigation Matrix</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Full CBT Canvas
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All 200 questions visible across 4 sections. Click any badge to immediately jump to its solution.
                    </p>
                  </div>
                </div>

                {/* Filters & Close */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMatrixFilter("all")}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        matrixFilter === "all"
                          ? "bg-slate-900 text-white font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All (200)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixFilter("wrong")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        matrixFilter === "wrong"
                          ? "bg-rose-500 text-white font-black"
                          : "text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      Wrong ({palette.filter((p) => p.selectedOption && !p.isCorrect).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixFilter("correct")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        matrixFilter === "correct"
                          ? "bg-emerald-600 text-white font-black"
                          : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Correct ({palette.filter((p) => p.isCorrect).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixFilter("skipped")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        matrixFilter === "skipped"
                          ? "bg-slate-700 text-white font-black"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      Skipped ({palette.filter((p) => !p.selectedOption).length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenMatrixOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                    title="Close matrix view"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body: 4 Section Columns Side-by-Side */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-slate-100/60">
                {sectionOrder.map((sec) => {
                  const secItems = palette.filter((p) => p.section === sec);
                  const secScore = score.bySection[sec];

                  return (
                    <div
                      key={sec}
                      className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col shadow-sm"
                    >
                      {/* Section Mini-Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
                            {sectionIcons[sec]} {sectionDisplayNames[sec]}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            {sectionQuestionRanges[sec]} · {secScore?.netScore ?? 0} pts ({secScore?.accuracyPercentage ?? 0}% acc)
                          </div>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          50 Qs
                        </span>
                      </div>

                      {/* 50 Question Grid in 5 columns x 10 rows */}
                      <div className="grid grid-cols-5 gap-1.5 flex-1">
                        {secItems.map((pItem) => {
                          const isWrong = pItem.selectedOption && !pItem.isCorrect;
                          const isCorrect = pItem.isCorrect;
                          const isSkipped = !pItem.selectedOption;

                          // Check if item matches the active matrix filter
                          let isDimmed = false;
                          if (matrixFilter === "wrong" && !isWrong) isDimmed = true;
                          if (matrixFilter === "correct" && !isCorrect) isDimmed = true;
                          if (matrixFilter === "skipped" && !isSkipped) isDimmed = true;

                          let bgClass = "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200";
                          if (isCorrect) {
                            bgClass = "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-xs";
                          } else if (isWrong) {
                            bgClass = "bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-xs";
                          }

                          return (
                            <button
                              key={pItem.questionId}
                              type="button"
                              onClick={() => handlePaletteClick(pItem)}
                              className={`h-9 rounded-xl text-xs font-black font-tabular border flex items-center justify-center transition-all ${bgClass} ${
                                isDimmed ? "opacity-20 pointer-events-none scale-95" : "hover:scale-105 active:scale-95"
                              }`}
                              title={`Q.${pItem.questionNumber} [${sec}]: ${
                                pItem.topicLabel ? pItem.topicLabel + " • " : ""
                              }${isCorrect ? "Correct" : isWrong ? "Wrong (-0.25)" : "Skipped"}`}
                            >
                              {pItem.questionNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer Note */}
              <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Correct (+1)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span> Wrong (-0.25)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span> Skipped
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 sm:mt-0">
                  Tip: Click any number to close this matrix and view the full question solution below.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Question Review List (Section-by-Section 50 Questions) */}
        <div ref={reviewSectionRef} id="review-questions-section" className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 sm:p-8">
          {/* Section Selector Tabs (Reasoning Q1-50, GA Q51-100, Quant Q101-150, English Q151-200) */}
          <div className="border-b border-slate-200 pb-5 mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-exam-primary" /> Question Review & Detailed Solutions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing 50 questions at a time to ensure lightning-fast performance and smooth scrolling.
                </p>
              </div>

              {/* Expand / Collapse All Toggle */}
              <button
                type="button"
                onClick={toggleAllExpanded}
                className="self-start sm:self-auto text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
              >
                {allExpanded ? "Collapse All Cards" : "Expand All Cards"}
              </button>
            </div>

            {/* 4 Primary Section Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {sectionOrder.map((secKey) => {
                const isActive = activeSection === secKey;
                const secScore = score.bySection[secKey];

                return (
                  <button
                    key={secKey}
                    type="button"
                    onClick={() => handleSelectSection(secKey)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-slate-50/70 hover:bg-slate-100/80 text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                        {sectionIcons[secKey]} {secKey}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-white text-slate-500 border border-slate-200"
                      }`}>
                        {sectionQuestionRanges[secKey]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className={isActive ? "text-slate-300" : "text-slate-500"}>
                        Net: <strong className={isActive ? "text-white font-black" : "text-slate-900 font-bold"}>{secScore?.netScore ?? 0}</strong>
                      </span>
                      <span className={`text-[11px] font-semibold ${
                        isActive ? "text-emerald-300" : "text-emerald-600"
                      }`}>
                        {secScore?.accuracyPercentage ?? 0}% acc
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "all" ? "bg-white text-exam-primary shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  All in Section ({currentQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("wrong")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "wrong" ? "bg-white text-rose-700 shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  Wrong ({currentQuestions.filter((q) => q.selectedOption && !q.isCorrect).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("correct")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "correct" ? "bg-white text-emerald-700 shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  Correct ({currentQuestions.filter((q) => q.isCorrect).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("unanswered")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "unanswered" ? "bg-white text-slate-800 shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  Skipped ({currentQuestions.filter((q) => !q.selectedOption).length})
                </button>
              </div>

              {/* View All 200 Toggle Option */}
              <button
                type="button"
                onClick={() => handleSelectSection(activeSection === "ALL" ? "REASONING" : "ALL")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{activeSection === "ALL" ? "Switch Back to 50-Question View" : "Show All 200 Questions Together"}</span>
              </button>
            </div>
          </div>

          {/* Section Questions Render Area */}
          {sectionLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-exam-primary animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Loading questions for {sectionDisplayNames[activeSection as SectionType] || activeSection}...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No questions found matching the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((item) => {
                const q = item.question;
                if (!q) return null;
                const isExpanded = expandedQuestions[item.questionId] !== false;

                // Find global question index from 200-question palette
                const pItem = palette.find((p) => p.questionId === item.questionId);
                const globalIndex = pItem?.questionNumber || 1;

                let statusBadge = (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Skipped (0.00)
                  </span>
                );

                if (item.isCorrect) {
                  statusBadge = (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                      +1.00 Correct
                    </span>
                  );
                } else if (item.selectedOption) {
                  statusBadge = (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200">
                      -0.25 Wrong
                    </span>
                  );
                }

                return (
                  <div
                    key={item.questionId}
                    id={`review-q-${item.questionId}`}
                    className={`border rounded-2xl p-5 transition ${
                      item.isCorrect
                        ? "border-emerald-200 bg-emerald-50/20"
                        : item.selectedOption
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                      onClick={() => toggleExpand(item.questionId)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="bg-slate-800 text-white text-xs font-black px-2.5 py-1 rounded-md font-tabular">
                          Q.{globalIndex}
                        </span>
                        <div>
                          <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                            {q.section} SECTION
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                            {q.stemIsFigureOnly || q.questionText === "[figure]" ? "" : q.questionText}
                          </h4>

                          {/* Question Figure / Diagram / Match Table */}
                          {q.imagePath ? (
                            <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                              <img
                                src={q.imagePath}
                                alt="Question Diagram"
                                className="max-h-80 w-auto object-contain rounded-lg bg-white p-1"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {statusBadge}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Solution Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          {(["a", "b", "c", "d"] as const).map((optKey) => {
                            const isUserAnswer = item.selectedOption === optKey;
                            const isCorrectAnswer = q.correctOption === optKey;
                            const optText = q.options[optKey];
                            const optImageUrl =
                              q.optionImages?.[optKey] ||
                              (optText && (optText.startsWith("http://") || optText.startsWith("https://") || optText.startsWith("/uploads/"))
                                ? optText
                                : "");

                            let optStyle = "border-slate-200 bg-white text-slate-700";
                            if (isCorrectAnswer) {
                              optStyle = "border-emerald-400 bg-emerald-100 text-emerald-900 font-bold";
                            } else if (isUserAnswer) {
                              optStyle = "border-rose-400 bg-rose-100 text-rose-900 font-bold";
                            }

                            return (
                              <div
                                key={optKey}
                                className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${optStyle}`}
                              >
                                <span className="uppercase font-black">({optKey})</span>
                                {optImageUrl ? (
                                  <img
                                    src={optImageUrl}
                                    alt={`Option ${optKey.toUpperCase()}`}
                                    className="max-h-28 w-auto object-contain rounded border border-slate-200 bg-white p-1"
                                  />
                                ) : (
                                  <span className="flex-1 leading-relaxed">{optText}</span>
                                )}
                                {isCorrectAnswer && (
                                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                    Correct Key
                                  </span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                    Your Choice
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Solution Explanation */}
                        {q.explanation ? (
                          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950">
                            <p className="font-black text-sm flex items-center gap-1.5 mb-1.5 text-exam-primary">
                              <HelpCircle className="w-4 h-4 text-blue-600" /> Solution & Explanation:
                            </p>
                            <p className="leading-relaxed text-[13px]">{q.explanation}</p>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                            <span>Verified against official NBEMS / SSC CHSL Answer Key.</span>
                            <span className="font-bold text-slate-500 uppercase text-[10px]">
                              {q.sourceExam || "Official PYQ"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Next Section Continuation Footer */}
          {nextSection && (
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Completed review for <strong>{sectionDisplayNames[activeSection as SectionType]}</strong>.
                </p>
                <p className="text-xs text-slate-400">
                  Ready to proceed to the next 50 questions?
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleSelectSection(nextSection);
                  reviewSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md transition transform active:scale-95"
              >
                <span>Continue to {sectionDisplayNames[nextSection]} ({sectionQuestionRanges[nextSection]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — Official NBEMS Junior Assistant Examination Simulation Analytics
      </footer>
    </div>
  );
}
