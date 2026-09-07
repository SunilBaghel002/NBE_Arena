"use client";

import React from "react";
import {
  School,
  Building,
  Rocket,
  Video,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface TargetAudienceProps {
  onOpenDemoModal: (tier?: string) => void;
}

export const TargetAudience: React.FC<TargetAudienceProps> = ({ onOpenDemoModal }) => {
  const audiences = [
    {
      icon: School,
      title: "SSC & NBE Coaching Institutes",
      subtitle: "Offline & Hybrid Batches",
      description:
        "Run full computer-lab mock exam sessions with authentic TCS/NBEMS-style interfaces. Provide your offline students with real exam-hall psychological conditioning and eliminate paper wastage.",
      benefits: [
        "Batch-wise student progress and rank tracking",
        "Synchronized 180-minute exam hall simulation",
        "Instant PDF question bank conversion",
      ],
      ctaTier: "SaaS Pro",
    },
    {
      icon: Building,
      title: "DSSSB & State Exam Academies",
      subtitle: "Government Job Preparation Hubs",
      description:
        "Cater to high-competition municipal and state recruitment exams (LDC, Steno, Junior Assistant). Enforce official −0.25 penalty physics and section-wise qualification cutoffs.",
      benefits: [
        "Tailored state syllabus question pools",
        "Sectional cut-off and time-limit enforcement",
        "Automated error review with detailed solution keys",
      ],
      ctaTier: "SaaS Pro",
    },
    {
      icon: Rocket,
      title: "Niche EdTech Startups & Portals",
      subtitle: "Scalable Test-Prep SaaS Infrastructure",
      description:
        "Launch your own full-stack mock test platform in days rather than quarters. Built on Next.js 14 and MongoDB Atlas with high-performance APIs and multi-tenant security.",
      benefits: [
        "White-label branding with custom domains",
        "High-concurrency cloud architecture",
        "Zero manual question entry via Vision AI",
      ],
      ctaTier: "Custom Enterprise",
    },
    {
      icon: Video,
      title: "YouTube Educators & Creators",
      subtitle: "Monetize Test Series Directly",
      description:
        "Replace unmonetized Google Forms, Telegram quizzes, and static PDFs with a high-prestige, branded CBT testing portal tailored for your subscriber community.",
      benefits: [
        "Personalized creator portal & custom logos",
        "Automated student registration & attempt control",
        "AI diagnostic reports to elevate student pass rates",
      ],
      ctaTier: "SaaS Starter",
    },
  ];

  return (
    <section id="who-its-for" className="py-20 md:py-28 bg-slate-50/60 border-t border-slate-200 text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Target Organizations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Who is NBE Arena Built For?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            From premier offline coaching institutes to digital test-prep founders, NBE Arena provides
            the mission-critical CBT infrastructure you need to win student trust.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            return (
              <div
                key={aud.title}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      {aud.subtitle}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{aud.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {aud.description}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {aud.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Recommended: <strong className="text-blue-700">{aud.ctaTier}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenDemoModal(aud.ctaTier)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>Request Institute Pilot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
