"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { TrustStrip } from "./TrustStrip";
import { FeatureGrid } from "./FeatureGrid";
import { HowItWorks } from "./HowItWorks";
import { AnalyticsPreview } from "./AnalyticsPreview";
import { TargetAudience } from "./TargetAudience";
import { PricingTiers } from "./PricingTiers";
import { ContactModal } from "./ContactModal";
import { LandingFooter } from "./LandingFooter";
import { PhoneCall, Sparkles, MessageSquare } from "lucide-react";

export const LandingView: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("SaaS Pro");

  const handleOpenDemoModal = (tier: string = "SaaS Pro") => {
    setSelectedTier(tier);
    setDemoModalOpen(true);
  };

  const handleCloseDemoModal = () => {
    setDemoModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* 1. Sticky Navigation */}
      <LandingNavbar onOpenDemoModal={handleOpenDemoModal} />

      {/* Main Sections */}
      <main className="flex-1">
        {/* 2. Hero Section with CBT Simulator & Analytics Mockup */}
        <HeroSection onOpenDemoModal={handleOpenDemoModal} />

        {/* 3. Trust Strip (Target Exams: NBE, SSC, DSSSB) */}
        <TrustStrip />

        {/* 4. Feature Grid (6 SaaS Cards) */}
        <FeatureGrid onOpenDemoModal={handleOpenDemoModal} />

        {/* 5. How It Works (3-Step Pipeline) */}
        <HowItWorks />

        {/* 6. Analytics Preview (Interactive Trajectory & Negative Marking) */}
        <AnalyticsPreview />

        {/* 7. Target Audience (Coaching Institutes, Academies, Startups) */}
        <TargetAudience onOpenDemoModal={handleOpenDemoModal} />

        {/* 8. Pricing Tiers (Pilot, SaaS Starter, SaaS Pro, Custom Enterprise) */}
        <PricingTiers onOpenDemoModal={handleOpenDemoModal} />

        {/* Embedded On-Page Demo Booking Anchor */}
        <section id="contact" className="py-16 bg-gradient-to-b from-white via-slate-50 to-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Founder-Led Evaluation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Ready to Upgrade Your Institute to White-Label CBT?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience the platform live. We will ingest one of your coaching institute&apos;s past exam
              papers during the call and generate a functional 200-question mock test.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/book-demo?plan=SaaS+Pro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Book 30-Min Walkthrough</span>
              </Link>

              <a
                href="https://wa.me/919310065542?text=Hi%20Sunil%2C%20I%20would%20like%20to%20schedule%20an%20institutional%20CBT%20demo%20call%20for%20my%20academy."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-sm px-6 py-4 rounded-xl border border-slate-300 shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Sunil (+91 93100 65542)</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Lead Capture Modal */}
      <ContactModal
        isOpen={demoModalOpen}
        onClose={handleCloseDemoModal}
        initialTier={selectedTier}
      />

      {/* 10. Landing Footer */}
      <LandingFooter />
    </div>
  );
};
