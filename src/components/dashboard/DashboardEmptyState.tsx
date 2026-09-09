"use client";

import React from "react";
import {
  Sparkles,
  TrendingUp,
  Compass,
  ShieldAlert,
  Bot,
  Play,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface DashboardEmptyStateProps {
  userName: string;
  onStartFirstMock: () => void;
  isGenerating?: boolean;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  userName,
  onStartFirstMock,
  isGenerating = false,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Decorative Badge & Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-exam-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200/80">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Welcome to NBE Arena, {userName}!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your Analytical Exam Command Center Awaits
        </h2>

        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Complete your first authentic 200-question NBEMS Computer-Based Mock Test to unlock deep diagnostic analytics, sectional radar symmetry, and AI mentor reports.
        </p>
      </div>

      {/* 4 Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Score Trajectory</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Monitor net scores plotted against the 150 qualifying benchmark line.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Sectional Balance</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Radar balance diagrams showing Reasoning, GA, Quant, and English accuracy.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Penalty Leakage</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Quantify marks lost to −0.25 negative penalties and wild guessing.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">AI Strategic Mentor</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automated multi-mock longitudinal diagnosis powered by Groq LLM.
          </p>
        </div>
      </div>

      {/* Primary Call to Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartFirstMock}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 bg-exam-primary hover:bg-exam-primaryHover text-white font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isGenerating ? "Preparing Mock..." : "Take Your First Mock Test"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-slate-400 mt-3 font-medium">
          200 Questions · 180 Minutes · Official NBEMS Jr. Assistant Blueprint (+1 / −0.25)
        </p>
      </div>
    </div>
  );
};
