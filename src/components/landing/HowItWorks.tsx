"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  Layers,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      icon: UploadCloud,
      title: "Bulk Ingest PYQ PDFs via Vision VLM",
      subtitle: "Digital or Scanned Papers",
      description:
        "Upload raw examination PDFs (SSC CHSL, CGL, MTS, DSSSB, NBE). The Hybrid Pipeline routes text pages to ultra-fast Groq LLMs and image/scanned pages to high-DPI Multimodal Vision VLMs (Qwen2.5-VL / Gemini Flash). Extracts questions, options, non-verbal diagrams, and answer keys with zero manual typing.",
      badge: "Hybrid Vision Pipeline",
      details: [
        "150–200 DPI high-resolution page rendering",
        "Automatic table & geometry figure boundary extraction",
        "SHA-256 hash deduplication to eliminate duplicate questions",
      ],
      previewSnippet: "PDF Ingestion: 200 Qs segmented · 0 manual errors · 4 sections assigned",
    },
    {
      number: "02",
      icon: Layers,
      title: "Algorithmic 200-Question Mock Assembly",
      subtitle: "Exact 4 × 50 Section Balance",
      description:
        "The mock generation engine pulls 50 random questions from each section pool (Reasoning, GA, Quant, English). It rigorously enforces syllabus parity, automatically excluding complex trigonometry/higher geometry from the Quant pool to ensure 100% adherence to NBE exam standards.",
      badge: "Strict Sectional Gates",
      details: [
        "50 Reasoning + 50 GA + 50 Quant + 50 English = 200 MCQs",
        "Zero topic skew guarantee with balanced difficulty distribution",
        "Cloud-persisted in MongoDB Atlas with locked answer keys",
      ],
      previewSnippet: "Mock Generated: 200 MCQs · 180 Minutes · Locked answer keys until submission",
    },
    {
      number: "03",
      icon: Award,
      title: "Exam-Hall CBT Simulation & AI Diagnosis",
      subtitle: "180 Min Countdown + −0.25 Penalty Physics",
      description:
        "Candidates review mandatory pre-exam instructions before the 180-minute countdown timer begins. Includes 5-column palette, sectional jump tabs, and emergency auto-save. Upon submission, the platform delivers instantaneous scorecards, -0.25 negative marking leakage analytics, and an AI multi-mock strategic diagnostic report.",
      badge: "CBT Hall + AI Diagnosis",
      details: [
        "180-min continuous timer starting after instructions confirmation",
        "Precision −0.25 penalty calculation against 150/200 qualifying target",
        "Groq AI mentor analyzes multi-mock error patterns and guessing tendencies",
      ],
      previewSnippet: "Net Score: 154.75 / 200 · Qualified! · Guessing Leakage: −7.75 Marks",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-50/70 border-y border-slate-200 text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Operational Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            From Raw PDF to Full CBT Exam in 3 Seamless Steps
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Eliminate weeks of manual typing and proofreading. Our automated pipeline transforms
            exam archives into authentic, interactive CBT mocks with zero hassle.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-2xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between relative ${
                  isSelected
                    ? "bg-white border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/30 -translate-y-1"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="space-y-4">
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black font-mono text-slate-200">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-1">
                    <div className="p-3 w-fit rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mb-3 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{step.title}</h3>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Key Highlights Bulleted */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {step.details.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Snippet Pill */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 truncate">
                    {step.previewSnippet}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
