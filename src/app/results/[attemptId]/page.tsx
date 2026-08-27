"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
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
  BookOpen,
  Filter,
  Check,
  X,
  Minus,
  Grid,
} from "lucide-react";
import { Attempt, AttemptScore, Question, SectionType } from "@/types";

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
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [mockTitle, setMockTitle] = useState("NBE Mock Test");
  const [questionsWithReview, setQuestionsWithReview] = useState<ReviewItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "wrong" | "correct" | "unanswered">("all");
  const [sectionFilter, setSectionFilter] = useState<"ALL" | SectionType>("ALL");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [isGeneratingMock, setIsGeneratingMock] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/results/${attemptId}`);
        if (!res.ok) {
          throw new Error("Results could not be found");
        }
        const data = await res.json();
        setAttempt(data.attempt);
        setMockTitle(data.mockTitle);
        setQuestionsWithReview(data.questionsWithReview || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load score");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId) {
      fetchResults();
    }
  }, [attemptId]);

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

  const toggleBookmark = (qId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const scrollToQuestion = (qId: string) => {
    const el = document.getElementById(`review-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setExpandedQuestions((prev) => ({ ...prev, [qId]: true }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-exam-primary animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-lg text-slate-800">Calculating Scorecard & Negative Penalties</h2>
          <p className="text-xs text-slate-500 mt-1">Evaluating response accuracy against official keys...</p>
        </div>
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

  const filteredQuestions = questionsWithReview.filter((item) => {
    // Section filter
    if (sectionFilter !== "ALL" && item.question?.section !== sectionFilter) {
      return false;
    }
    // Status filter
    if (filterType === "correct") return item.isCorrect;
    if (filterType === "wrong") return item.selectedOption && !item.isCorrect;
    if (filterType === "unanswered") return !item.selectedOption;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const sectionOrder: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
  const sectionDisplayNames: Record<SectionType, string> = {
    REASONING: "General Intelligence & Reasoning",
    GA: "General Awareness",
    QUANT: "Quantitative Aptitude",
    ENGLISH: "English Comprehension",
  };

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Universal Top Navbar */}
      <Navbar />

      {/* Main Scorecard Body */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
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

        {/* Section-Wise Breakdown Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-exam-primary" /> Section-wise Performance & Penalty Analysis
            </h2>
            <span className="text-xs text-slate-500 font-medium">50 Questions per section</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionOrder.map((secKey) => {
              const sec = score.bySection[secKey];
              if (!sec) return null;

              return (
                <div
                  key={secKey}
                  className="bg-white rounded-xl shadow-sm border border-exam-border p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-exam-primary uppercase tracking-wider">
                        {secKey}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {formatSeconds(sec.timeSpentSeconds)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-800 mb-4 truncate">
                      {sectionDisplayNames[secKey]}
                    </h3>

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

        {/* Question Palette Quick-Navigator */}
        <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Grid className="w-4 h-4 text-exam-primary" /> Question Navigation Palette (200 Questions)
              </h3>
              <p className="text-xs text-slate-500">Click any question number to jump directly to its detailed review.</p>
            </div>
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
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 max-h-48 overflow-y-auto p-1">
            {questionsWithReview.map((item, idx) => {
              let bg = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";
              if (item.isCorrect) {
                bg = "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600";
              } else if (item.selectedOption) {
                bg = "bg-rose-500 text-white hover:bg-rose-600 border-rose-600";
              }

              return (
                <button
                  key={item.questionId}
                  type="button"
                  onClick={() => scrollToQuestion(item.questionId)}
                  className={`h-8 rounded-lg text-xs font-bold font-tabular border flex items-center justify-center transition ${bg}`}
                  title={`Q.${idx + 1}: ${item.isCorrect ? "Correct" : item.selectedOption ? "Wrong" : "Skipped"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="bg-white rounded-2xl shadow-sm border border-exam-border p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-exam-primary" /> Full 200-Question Paper Solution Review
              </h2>
              <p className="text-xs text-slate-500">
                Compare your responses against official answer keys and step-by-step explanations.
              </p>
            </div>

            {/* Section & Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Section Select */}
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as any)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-exam-primary"
              >
                <option value="ALL">All Sections (200 Qs)</option>
                <option value="REASONING">Reasoning (50 Qs)</option>
                <option value="GA">General Awareness (50 Qs)</option>
                <option value="QUANT">Quant Aptitude (50 Qs)</option>
                <option value="ENGLISH">English (50 Qs)</option>
              </select>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "all" ? "bg-white text-exam-primary shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  All ({questionsWithReview.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("wrong")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "wrong" ? "bg-white text-rose-700 shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  Wrong ({score.wrongCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("correct")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "correct" ? "bg-white text-emerald-700 shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  Correct ({score.correctCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("unanswered")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterType === "unanswered" ? "bg-white text-slate-800 shadow-sm font-black" : "text-slate-600"
                  }`}
                >
                  Skipped ({score.unansweredCount})
                </button>
              </div>
            </div>
          </div>

          {/* Question Review Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((item) => {
              const q = item.question;
              if (!q) return null;
              const isExpanded = expandedQuestions[item.questionId] !== false; // expanded by default
              const isBookmarked = bookmarkedIds.includes(item.questionId);

              // Find overall question index (1 to 200)
              const globalIndex = questionsWithReview.findIndex((x) => x.questionId === item.questionId) + 1;

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
                      <span className="bg-slate-800 text-white text-xs font-black px-2.5 py-1 rounded-md">
                        Q.{globalIndex}
                      </span>
                      <div>
                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                          {q.section} SECTION
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                          {q.questionText}
                        </h4>

                        {/* Question Figure / Diagram Image */}
                        {q.imagePath ? (
                          <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                            <img
                              src={q.imagePath}
                              alt="Question Diagram"
                              className="max-h-56 w-auto object-contain rounded-lg bg-white p-1"
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
                          const isImageOption = optText && (optText.startsWith("http://") || optText.startsWith("https://") || optText.startsWith("/uploads/"));

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
                              {isImageOption ? (
                                <img
                                  src={optText}
                                  alt={`Option ${optKey.toUpperCase()}`}
                                  className="max-h-20 w-auto object-contain rounded border border-slate-200 bg-white p-1"
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
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-slate-400">
        NBE Arena — Official NBEMS Junior Assistant Examination Simulation Analytics
      </footer>
    </div>
  );
}
