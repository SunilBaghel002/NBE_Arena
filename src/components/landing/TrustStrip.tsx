"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  Cpu,
} from "lucide-react";

export const TrustStrip: React.FC = () => {
  const targetExams = [
    {
      name: "NBEMS Junior Assistant",
      pattern: "200 Qs · 180 Mins",
      tag: "Primary Target",
      badgeClass: "border-blue-200 bg-blue-50/50 text-blue-900",
      tagClass: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      name: "SSC CHSL (Tier 1)",
      pattern: "Reasoning · GA · Quant · Eng",
      tag: "100% Pattern Match",
      badgeClass: "border-amber-200 bg-amber-50/50 text-amber-900",
      tagClass: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      name: "SSC CGL (Tier 1)",
      pattern: "PYQ Ingestion Source",
      tag: "Standard MCQs",
      badgeClass: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
      tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      name: "SSC MTS / Havaldar",
      pattern: "Arithmetic & Vocab Focus",
      tag: "PYQ Pool",
      badgeClass: "border-purple-200 bg-purple-50/50 text-purple-900",
      tagClass: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      name: "DSSSB LDC / Jr. Assistant",
      pattern: "Delhi Subordinate Board",
      tag: "Full Syllabus Match",
      badgeClass: "border-rose-200 bg-rose-50/50 text-rose-900",
      tagClass: "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      name: "State PSC & High Court",
      pattern: "Clerical & Assistant Cadres",
      tag: "State Govt",
      badgeClass: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
      tagClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
  ];

  const assurances = [
    { icon: ShieldCheck, title: "100% Pattern Parity", desc: "200 Questions, 50 per section, 180-min continuous countdown" },
    { icon: Clock, title: "Tabular Numeral Timers", desc: "Monospace numerals with zero layout jitter during high-stakes testing" },
    { icon: Cpu, title: "Vision VLM Ingestion", desc: "Qwen2.5-VL and Groq LLM ingest scanned PDFs with diagrams and tables" },
    { icon: Database, title: "MongoDB Atlas Cloud", desc: "Multi-candidate persistence with isolated attempt records and analytics" },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200/90 py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Institutional Exam Pattern Alignment
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Engineered for High-Volume Central & State CBT Exams
          </h2>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {targetExams.map((exam) => (
            <div
              key={exam.name}
              className={`p-3.5 rounded-xl border bg-white ${exam.badgeClass} flex flex-col justify-between hover:scale-105 transition-all duration-200 shadow-xs hover:shadow-md`}
            >
              <div>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border block w-fit mb-1.5 ${exam.tagClass}`}>
                  {exam.tag}
                </span>
                <p className="font-bold text-xs text-slate-900 leading-snug">{exam.name}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">{exam.pattern}</p>
            </div>
          ))}
        </div>

        {/* Technical Assurances Strip */}
        <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assurances.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
