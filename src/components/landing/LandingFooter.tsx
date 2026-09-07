"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Mail,
  PhoneCall,
  MapPin,
  ExternalLink,
} from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-50 text-slate-700 border-t border-slate-200 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" href="#" showSubtitle={true} theme="light" />
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              The premier white-label Computer Based Test (CBT) engine with Multimodal Vision AI
              ingestion, 200-question NBEMS/SSC mock simulations, -0.25 negative marking physics,
              and multi-mock AI performance diagnostics.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Status: 100% Operational & Cloud Synced</span>
            </div>
          </div>

          {/* Col 3: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#features" className="hover:text-slate-900 transition">
                  CBT Hall Simulator
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 transition">
                  Vision PDF Ingestion
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-slate-900 transition">
                  Negative Marking Leakage
                </a>
              </li>
              <li>
                <a href="#who-its-for" className="hover:text-slate-900 transition">
                  Coaching Institute Solutions
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-900 transition">
                  Institutional Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Target Exams */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Exam Coverage</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>NBEMS Junior Assistant</li>
              <li>SSC CHSL (Tier-1)</li>
              <li>SSC CGL (Tier-1)</li>
              <li>SSC MTS / Havaldar</li>
              <li>DSSSB LDC / Jr. Assistant</li>
              <li>State High Court Clerical</li>
            </ul>
          </div>

          {/* Col 5: Contact & Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Direct Connect</h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <a href="mailto:sunilbaghel93100@gmail.com" className="hover:text-slate-900 transition font-medium">
                  sunilbaghel93100@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <a
                  href="https://wa.me/919310065542?text=Hi%20Sunil%2C%20I%20am%20interested%20in%20NBE%20Arena%20for%20my%20coaching%20institute."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition font-medium"
                >
                  +91 93100 65542 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Built with pride in India 🇮🇳</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 shadow-xs transition"
              >
                <span>Candidate Portal Login</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} NBE Arena. All rights reserved. Built for coaching institute
            excellence and candidate qualification.
          </p>
          <p className="max-w-md text-slate-500 leading-relaxed">
            Disclaimer: NBEMS, SSC, and DSSSB are registered trademarks of their respective government authorities.
            NBE Arena is an independent academic simulation and CBT technology platform.
          </p>
        </div>
      </div>
    </footer>
  );
};
