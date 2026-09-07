"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  LogIn,
  Sparkles,
  Menu,
  X,
  PhoneCall,
  Calendar,
  Layers,
  BarChart3,
  Building,
  HelpCircle,
} from "lucide-react";

interface LandingNavbarProps {
  onOpenDemoModal: (tier?: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenDemoModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "CBT Preview", href: "#preview" },
    { label: "Analytics", href: "#analytics" },
    { label: "Institutes", href: "#who-its-for" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-200/50 py-2.5 px-4 sm:px-6"
            : "bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-sm py-3 px-4 sm:px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo & Live Engine Status */}
          <div className="flex items-center gap-3">
            <BrandLogo size="md" href="/" showSubtitle={false} theme="light" />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CBT 2026 Live</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition shadow-xs"
              id="landing-signin-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Candidate Portal</span>
            </Link>

            <Link
              href="/book-demo?plan=SaaS+Pro"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition transform active:scale-95"
              id="landing-request-demo-btn"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Institute Demo</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden pt-4 pb-3 border-t border-slate-100 mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/book-demo?plan=SaaS+Pro"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs py-3 rounded-xl shadow-md"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>Book Institutional Demo Call</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
