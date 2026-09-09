"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Attempt, SectionType } from "@/types";
import { SyllabusTopicMetric } from "@/lib/syllabus-taxonomy";

interface TopicHeatmapProps {
  attempts: (Attempt & { mockTitle?: string })[];
}

export const TopicHeatmap: React.FC<TopicHeatmapProps> = ({ attempts }) => {
  const [topics, setTopics] = useState<SyllabusTopicMetric[]>([]);
  const [coverage, setCoverage] = useState({
    testedTopicsCount: 0,
    totalTopicsCount: 0,
    coveragePercentage: 0,
  });
  const [diagnostics, setDiagnostics] = useState({
    strongTopics: [] as string[],
    weakTopics: [] as string[],
    summary: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<"ALL" | SectionType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const totalScored = attempts.filter((a) => a.score).length;

  useEffect(() => {
    async function loadSyllabusHeatmap() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics/topic-heatmap");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
          if (data.coverage) setCoverage(data.coverage);
          if (data.diagnostics) setDiagnostics(data.diagnostics);
        }
      } catch (err) {
        console.error("Error loading syllabus heatmap:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSyllabusHeatmap();
  }, [totalScored]);

  // Filter topics by section and search query
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSection =
        selectedSection === "ALL" || t.section === selectedSection;
      const matchesSearch =
        searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [topics, selectedSection, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
      <div>
        {/* Header with Title & Coverage Gauge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-exam-primary" />
                <span>Official NBEMS Syllabus Diagnostic Heatmap</span>
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                AI Taxonomy
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mapped directly to NBEMS Junior Assistant Examination syllabus
            </p>
          </div>

          {/* Syllabus Coverage Badge */}
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 self-start sm:self-auto">
            <BookOpen className="w-4 h-4 text-exam-primary" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase leading-tight">
                Syllabus Coverage
              </span>
              <span className="text-xs font-black font-mono text-slate-900">
                {coverage.testedTopicsCount} / {coverage.totalTopicsCount} Topics{" "}
                <span className="text-emerald-600">({coverage.coveragePercentage}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Insight Callout */}
        {diagnostics.summary && totalScored > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-blue-900 font-bold">AI Diagnosis:</strong>{" "}
              {diagnostics.summary}
            </div>
          </div>
        )}

        {/* Controls: Section Filter Pills + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          {/* Section Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {(["ALL", "REASONING", "GA", "QUANT", "ENGLISH"] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                  selectedSection === sec
                    ? "bg-exam-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sec === "ALL"
                  ? "All Syllabus"
                  : sec === "REASONING"
                  ? "Reasoning"
                  : sec === "GA"
                  ? "Gen. Awareness"
                  : sec === "QUANT"
                  ? "Quantitative"
                  : "English"}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic..."
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-exam-primary"
            />
          </div>
        </div>

        {/* Heatmap Grid Viewport */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-exam-primary mb-2" />
            <span className="text-xs">Classifying attempts against syllabus taxonomy...</span>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No syllabus topics found matching your filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const acc = topic.accuracyPercentage;
              const isTested = topic.totalTested > 0;
              const isStrong = topic.status === "STRONG";
              const isMod = topic.status === "MODERATE";
              const isWeak = topic.status === "NEEDS_WORK";

              return (
                <div
                  key={topic.id}
                  className={`p-2.5 rounded-xl border text-xs transition flex flex-col justify-between ${
                    !isTested
                      ? "bg-slate-50/70 border-slate-200/80 text-slate-500"
                      : isStrong
                      ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                      : isMod
                      ? "bg-amber-50/70 border-amber-200/80 text-amber-950"
                      : "bg-rose-50/70 border-rose-200/80 text-rose-950"
                  }`}
                  title={`${topic.name}: ${topic.description}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] uppercase font-extrabold tracking-wider opacity-60">
                        {topic.section}
                      </span>
                      {isStrong && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                      {isWeak && (
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      )}
                    </div>
                    <span className="font-bold text-[11px] block truncate leading-snug">
                      {topic.name}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-black/5 font-mono">
                    <span className="text-[10px] opacity-75">
                      {isTested ? `${topic.correctCount}/${topic.totalTested} Qs` : "Untested"}
                    </span>
                    <span className="font-black text-xs">
                      {isTested ? `${acc}%` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-[11px]">Strong (&ge;75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span className="text-[11px]">Moderate (50-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span className="text-[11px]">Priority (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-300" />
            <span className="text-[11px]">Untested</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Official NBEMS Jr. Assistant Syllabus
        </span>
      </div>
    </div>
  );
};
