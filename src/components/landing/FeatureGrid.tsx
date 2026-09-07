"use client";

import React from "react";
import {
  MonitorCheck,
  Eye,
  FileSpreadsheet,
  TrendingDown,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface FeatureGridProps {
  onOpenDemoModal: (tier?: string) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onOpenDemoModal }) => {
  const features = [
    {
      icon: MonitorCheck,
      badge: "Real CBT Environment",
      title: "Authentic CBT Test Simulator",
      description:
        "Exact replication of TCS iON / NBEMS examination portals. Includes a 5-column palette, sectional navigation tabs, emergency local persistence, keyboard shortcuts [1, 2, 3, 4, N, P, M], and automatic zero-countdown submission.",
      metric: "180-min countdown · Monospace numerals",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200",
    },
    {
      icon: Eye,
      badge: "Hybrid Multimodal AI",
      title: "Vision VLM PDF Ingestion Pipeline",
      description:
        "Extract past year question papers directly from digital and scanned PDFs. Uses high-DPI rendering and multimodal Vision VLMs (Qwen2.5-VL / Gemini Flash) to parse questions, options, and official keys with 98%+ fidelity.",
      metric: "Zero manual data entry · Path A & Path B",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border-amber-200",
    },
    {
      icon: FileSpreadsheet,
      badge: "Rich Media & Tables",
      title: "Preserves Match Tables & Geometry Figures",
      description:
        "Intelligently captures complex match-the-column matrices, non-verbal series diagrams, and data interpretation tables without dropping formatting. All diagrams are auto-cropped and backed by high-speed CDN storage.",
      metric: "Automatic table & figure boundary detection",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-200",
    },
    {
      icon: TrendingDown,
      badge: "Scoring Science",
      title: "Precision −0.25 Negative Marking Analytics",
      description:
        "Highlights the hidden danger of wild guessing. Calculates exact net marks lost to negative penalties across total and sectional breakdowns, helping candidates master risk management to qualify above the 150/200 benchmark.",
      metric: "Net Score = Correct − (0.25 × Wrong)",
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50 border-rose-200",
    },
    {
      icon: BrainCircuit,
      badge: "AI Academic Mentor",
      title: "Multi-Mock Performance Diagnostics",
      description:
        "Powered by ultra-fast Groq LLMs, our AI mentor analyzes candidate performance patterns across multiple tests, detects cognitive fatigue trends, and delivers tailored strategic roadmaps with topic-specific remediation.",
      metric: "Synthesizes multi-attempt longitudinal trends",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 border-purple-200",
    },
    {
      icon: Building2,
      badge: "B2B SaaS Ready",
      title: "White-Label Institute Control & Admin",
      description:
        "Brand the examination portal with your coaching institute's identity. Features role-based access control, isolated candidate cohorts, drag-and-drop paper ingestion, and telemetry dashboards for batch directors.",
      metric: "Multi-candidate isolation · Admin RBAC",
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-white text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Engineered for High-Stakes Exam Hall Excellence
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Everything your coaching institute or test-prep academy needs to deliver authentic,
            proctored-grade computer-based mock exams with zero technical friction.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${feat.iconBg} shadow-xs group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                </div>

                {/* Metric Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{feat.metric}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-amber-50/50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              Want to see your institute&apos;s PYQ PDFs converted into live CBT mocks?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              We provide a live 30-minute founder walkthrough and instant sample paper ingestion.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenDemoModal("SaaS Pro")}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-md transition transform active:scale-95"
          >
            <span>Request Ingestion Walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
