"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";

interface PricingTiersProps {
  onOpenDemoModal: (tier?: string) => void;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({ onOpenDemoModal }) => {
  const tiers = [
    {
      name: "Pilot Batch",
      badge: "Trial Evaluation",
      price: "₹4,999",
      period: "one-time evaluation",
      description: "Ideal for coaching centers wanting to evaluate the CBT hall simulator with a single batch.",
      features: [
        "Up to 50 active candidate seats",
        "10 full-length 200-question mocks",
        "180-min continuous CBT countdown timer",
        "−0.25 negative marking scorecards",
        "Standard student dashboard access",
      ],
      ctaText: "Book Pilot Trial",
      popular: false,
      tierKey: "Pilot",
    },
    {
      name: "SaaS Starter",
      badge: "Small Academies",
      price: "₹14,999",
      period: "per month",
      description: "For independent coaching institutes preparing up to 250 candidates for NBE and SSC exams.",
      features: [
        "Up to 250 active candidate accounts",
        "Unlimited full-length mock test generation",
        "Admin PDF ingestion uploader (Vision AI)",
        "Sectional mastery & time speed analytics",
        "Candidate credentials manager",
        "Standard email & WhatsApp technical support",
      ],
      ctaText: "Choose Starter",
      popular: false,
      tierKey: "SaaS Starter",
    },
    {
      name: "SaaS Pro",
      badge: "Most Popular · High Value",
      price: "₹29,999",
      period: "per month",
      description: "Complete institutional CBT engine with AI performance diagnostics and multi-batch management.",
      features: [
        "Up to 1,000 active candidate accounts",
        "Unlimited mock generation & full PYQ bank",
        "Groq AI Multi-Mock Strategic Diagnostics",
        "Custom institute branding & logo in exam hall",
        "Batch-wise student telemetry & attendance tracking",
        "Dedicated account manager & onboarding call",
      ],
      ctaText: "Request Pro Demo",
      popular: true,
      tierKey: "SaaS Pro",
    },
    {
      name: "Custom Enterprise",
      badge: "Multi-Branch Networks",
      price: "Custom",
      period: "tailored SLA agreement",
      description: "Bespoke solution for state-wide coaching franchises, test-prep startups, and government academies.",
      features: [
        "Unlimited students & multi-branch hierarchy",
        "Custom domain (e.g. cbt.youracademy.in)",
        "Dedicated Vision VLM ingestion cluster",
        "Custom question pool filtering & tags",
        "White-label mobile PWA wrapper",
        "99.9% uptime SLA & 24/7 dedicated escalation",
      ],
      ctaText: "Contact Enterprise Sales",
      popular: false,
      tierKey: "Custom Enterprise",
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Institutional Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Transparent Pricing for High-Performance Coaching
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Choose a tier tailored to your student batch size. Every plan includes authentic
            NBEMS pattern simulations, continuous 180-min timers, and -0.25 negative marking.
          </p>
        </div>

        {/* 4 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? "bg-white border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/40 lg:-translate-y-2"
                  : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Popular Pill */}
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Recommended for Institutes</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {tier.badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{tier.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-xs text-slate-500 font-medium">/{tier.period}</span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    What&apos;s Included:
                  </span>
                  {tier.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href={`/book-demo?plan=${encodeURIComponent(tier.tierKey)}`}
                  className={`w-full py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                    tier.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Guarantee Note */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Need custom paper formatting or a batch trial before signing? Reach out for a tailored pilot setup.
          </span>
        </div>
      </div>
    </section>
  );
};
