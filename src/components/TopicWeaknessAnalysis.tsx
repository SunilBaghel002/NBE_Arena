"use client";

import React, { useState } from "react";
import {
  SectionType,
  TopicPerformance,
  MockTopicAnalysis,
  SectionTopicAnalysis,
} from "@/types";
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Compass,
  Calculator,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";

interface TopicWeaknessAnalysisProps {
  topicAnalysis: MockTopicAnalysis;
  onJumpToQuestion: (questionNumber: number, section: SectionType) => void;
}

export const TopicWeaknessAnalysis: React.FC<TopicWeaknessAnalysisProps> = ({
  topicAnalysis,
  onJumpToQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<SectionType | "OVERVIEW">("QUANT");

  const sectionTabs: { key: SectionType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      key: "QUANT",
      label: "Mathematics (Quant)",
      icon: <Calculator className="w-4 h-4 text-blue-600" />,
      color: "blue",
    },
    {
      key: "REASONING",
      label: "Reasoning & Intelligence",
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      color: "purple",
    },
    {
      key: "GA",
      label: "General Awareness",
      icon: <Compass className="w-4 h-4 text-amber-600" />,
      color: "amber",
    },
    {
      key: "ENGLISH",
      label: "English Comprehension",
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      color: "emerald",
    },
  ];

  const currentSectionData: SectionTopicAnalysis | undefined =
    activeTab !== "OVERVIEW" ? topicAnalysis.bySection[activeTab] : undefined;

  const totalWrongAcrossExam = Object.values(topicAnalysis.bySection).reduce(
    (acc, s) => acc + s.totalWrong,
    0
  );

  const topWeakTopics = topicAnalysis.overallWeakTopics.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-exam-border p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Topic-Wise Mistake & Weakness Diagnostic
            </h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              All 4 Sections
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            Pinpoint the exact topics where marks were lost (e.g. Percentage, Ratio, Coding-Decoding)
            along with wrong question numbers and targeted CBT revision fixes to eliminate negative marking.
          </p>
        </div>

        {/* Global Weakness Stats Pill */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 self-start lg:self-auto">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Wrong Answers
            </div>
            <div className="text-lg font-black text-rose-600 font-tabular leading-tight">
              {totalWrongAcrossExam} Questions
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Topics to Work On
            </div>
            <div className="text-lg font-black text-slate-800 font-tabular leading-tight">
              {topicAnalysis.overallWeakTopics.length} Topics
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Top Weak Areas Overview + 4 Specific Sections) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("OVERVIEW")}
          className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
            activeTab === "OVERVIEW"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${activeTab === "OVERVIEW" ? "text-amber-300" : "text-amber-500"}`} />
            <div>
              <div className="text-xs font-black">Top Priority Fixes</div>
              <div className={`text-[10px] ${activeTab === "OVERVIEW" ? "text-slate-300" : "text-slate-400"}`}>
                All 4 Sections
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${
            activeTab === "OVERVIEW" ? "bg-white/20 text-white" : "bg-white text-rose-600 border border-slate-200"
          }`}>
            {topicAnalysis.overallWeakTopics.length}
          </span>
        </button>

        {sectionTabs.map((sec) => {
          const isActive = activeTab === sec.key;
          const sData = topicAnalysis.bySection[sec.key];
          const wrongCount = sData?.totalWrong || 0;
          const weakTopicCount = sData?.topicsToWorkOn.length || 0;

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveTab(sec.key)}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {sec.icon}
                <div className="truncate">
                  <div className="text-xs font-black truncate">{sec.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {weakTopicCount} weak topic{weakTopicCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 ${
                  isActive
                    ? wrongCount > 0 ? "bg-rose-500 text-white" : "bg-white/20 text-white"
                    : wrongCount > 0 ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {wrongCount} wrong
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: TOP OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm text-amber-950 mb-0.5">
                Targeted Weak Topic Action List
              </strong>
              These are your highest-loss topics ranked by wrong answers. Clicking any question chip jumps
              directly into that question's solution card in the review below so you can inspect your error immediately.
            </div>
          </div>

          {topWeakTopics.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-black text-emerald-900 text-base">Exceptional Accuracy!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                No significant topic weaknesses detected. Keep maintaining this precision in your next mock!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topWeakTopics.map((topic) => (
                <TopicCard
                  key={`${topic.section}-${topic.topicKey}`}
                  topic={topic}
                  onJump={onJumpToQuestion}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SPECIFIC SECTION BREAKDOWN */}
      {activeTab !== "OVERVIEW" && currentSectionData && (
        <div className="space-y-5">
          {/* Section Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{currentSectionData.sectionLabel}</span>
                <span className="text-xs font-semibold text-slate-500">
                  (50 Questions Total)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentSectionData.topicsToWorkOn.length > 0
                  ? `${currentSectionData.topicsToWorkOn.length} topic(s) lost marks due to wrong answers. Review solutions and apply the CBT fix.`
                  : "All topics answered cleanly with zero negative marking in this section!"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentSectionData.totalCorrect} Correct
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                {currentSectionData.totalWrong} Wrong
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700">
                {currentSectionData.totalSkipped} Skipped
              </span>
            </div>
          </div>

          {/* Section Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSectionData.allTopics.map((topic) => (
              <TopicCard
                key={`${topic.section}-${topic.topicKey}`}
                topic={topic}
                onJump={onJumpToQuestion}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual topic cards
interface TopicCardProps {
  topic: TopicPerformance;
  onJump: (questionNumber: number, section: SectionType) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onJump }) => {
  const isWeak = topic.wrong > 0;
  const isCritical = topic.wrong >= 2;

  const sectionBadges: Record<SectionType, { label: string; bg: string; text: string }> = {
    QUANT: { label: "Mathematics", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    REASONING: { label: "Reasoning", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
    GA: { label: "General Awareness", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    ENGLISH: { label: "English", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  };

  const secBadge = sectionBadges[topic.section];

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isCritical
          ? "bg-white border-rose-200 shadow-sm ring-1 ring-rose-200"
          : isWeak
          ? "bg-white border-amber-200 shadow-sm"
          : "bg-slate-50/70 border-slate-200"
      }`}
    >
      {/* Top row: Topic Label & Priority Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${secBadge.bg} ${secBadge.text} inline-block mb-1.5`}
          >
            {secBadge.label}
          </span>
          <h4 className="text-sm font-black text-slate-900 leading-snug">
            {topic.topicLabel}
          </h4>
        </div>

        {isCritical ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Must Work On
          </span>
        ) : isWeak ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            <TrendingDown className="w-3 h-3 text-amber-600" /> Needs Work
          </span>
        ) : topic.correct > 0 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Solid
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 shrink-0">
            Skipped
          </span>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Qs</div>
          <div className="text-xs font-black text-slate-800 font-tabular">{topic.total}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-emerald-600 uppercase">Correct</div>
          <div className="text-xs font-black text-emerald-700 font-tabular">{topic.correct}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-rose-600 uppercase">Wrong</div>
          <div className="text-xs font-black text-rose-700 font-tabular">
            {topic.wrong > 0 ? `-${topic.wrong}` : "0"}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</div>
          <div className="text-xs font-black text-slate-800 font-tabular">
            {topic.accuracyPercentage}%
          </div>
        </div>
      </div>

      {/* Wrong Question Chips with 1-Click Jump */}
      {topic.wrongQuestionNumbers.length > 0 && (
        <div className="mb-3 pt-1">
          <div className="text-[11px] font-bold text-rose-700 flex items-center justify-between mb-1.5">
            <span>Wrong in this mock (Click to inspect):</span>
            <span className="text-[10px] font-semibold text-slate-400">
              Penalty: -{(topic.wrong * 0.25).toFixed(2)} pts
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topic.wrongQuestionNumbers.map((qNum) => (
              <button
                key={qNum}
                type="button"
                onClick={() => onJump(qNum, topic.section)}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs transition transform hover:scale-105 active:scale-95"
                title={`Jump to Question #${qNum} solution review`}
              >
                <span>Q.{qNum}</span>
                <ArrowUpRight className="w-3 h-3 text-rose-400 group-hover:text-rose-600 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CBT Action Advice Fix */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-start gap-2 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-bold">CBT Fix: </strong>
          {topic.actionAdvice}
        </p>
      </div>
    </div>
  );
};
