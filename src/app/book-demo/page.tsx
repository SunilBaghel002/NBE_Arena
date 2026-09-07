"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PhoneCall,
  MessageSquare,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
} from "lucide-react";

function BookDemoContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "SaaS Pro";

  const [name, setName] = useState("");
  const [institute, setInstitute] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batchSize, setBatchSize] = useState("50-200");
  const [tier, setTier] = useState(planParam);
  const [selectedExams, setSelectedExams] = useState<string[]>([
    "NBEMS Junior Assistant",
    "SSC CHSL / CGL",
  ]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{ id?: string; message?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (planParam) {
      setTier(planParam);
    }
  }, [planParam]);

  const toggleExam = (examName: string) => {
    if (selectedExams.includes(examName)) {
      setSelectedExams(selectedExams.filter((e) => e !== examName));
    } else {
      setSelectedExams([...selectedExams, examName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          institute,
          email,
          phone,
          batchSize,
          targetExams: selectedExams,
          tier,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit demo request.");
      }

      setSubmittedLead({ id: data.leadId, message: data.message });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error submitting demo inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-slate-200/80 mb-8">
        <BrandLogo size="md" href="/" showSubtitle={false} theme="light" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Why Book a Demo */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>30-Minute Live Walkthrough</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Experience the 1:1 CBT Engine for Your Academy
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Schedule a personalized demonstration with founder Sunil Baghel. We will review your past
            exam papers, show you automated Vision PDF ingestion live, and setup your institutional mock portal.
          </p>

          <div className="space-y-3.5 pt-2 border-t border-slate-200/80">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Live Scanned PDF Ingestion</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Drop one of your institute&apos;s past papers during the call and watch it convert to a live 200-Q CBT.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">White-Label Branding & Colors</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Custom academy emblem, domain routing, and candidate isolation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Strict −0.25 Penalty Diagnostics</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant student scorecards with AI weak-spot analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp Contact Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Prefer Direct WhatsApp Chat?</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Message founder Sunil Baghel directly on WhatsApp for immediate onboarding and answers.
            </p>
            <a
              href="https://wa.me/919310065542?text=Hi%20Sunil%2C%20I%20would%20like%20to%20schedule%20an%20institutional%20CBT%20demo%20call%20for%20my%20academy."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition"
            >
              <span>WhatsApp Sunil (+91 93100 65542)</span>
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Booking Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 h-2 w-full" />

          <div className="p-6 sm:p-8">
            {submittedLead ? (
              /* Success Confirmation View */
              <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black text-slate-900">Demo Request Confirmed!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you, <strong className="text-slate-900">{name}</strong>. Founder Sunil Baghel and our
                    academic deployment team will connect with you on WhatsApp / email within 24 hours.
                  </p>
                  {submittedLead.id && (
                    <span className="text-xs font-mono text-slate-400 block pt-1">
                      Reference Lead ID: {submittedLead.id}
                    </span>
                  )}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/919310065542?text=${encodeURIComponent(
                      `Hi Sunil, I just submitted an institutional demo request for ${institute || name} (Plan: ${tier}). Let's schedule the walkthrough!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-3.5 rounded-xl shadow-md transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant WhatsApp Connect (+91 93100 65542)</span>
                  </a>

                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Book Your Institutional Walkthrough</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in your coaching institute details below. We will customize your demo paper beforehand.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Your Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Coaching Academy / Institute</label>
                    <input
                      type="text"
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      placeholder="e.g. Apex IAS & SSC Academy"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Work Email <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="director@academy.in"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      WhatsApp Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Active Student Batch Size</label>
                    <select
                      value={batchSize}
                      onChange={(e) => setBatchSize(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                    >
                      <option value="Under 50">Under 50 students (Pilot)</option>
                      <option value="50-200">50 - 200 students</option>
                      <option value="200-500">200 - 500 students</option>
                      <option value="500-1,000">500 - 1,000 students</option>
                      <option value="1,000+">1,000+ students (Enterprise Network)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Plan of Interest</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                    >
                      <option value="Pilot">Pilot Trial (₹4,999 evaluation)</option>
                      <option value="SaaS Starter">SaaS Starter (₹14,999/mo)</option>
                      <option value="SaaS Pro">SaaS Pro (₹29,999/mo - Recommended)</option>
                      <option value="Custom Enterprise">Custom Enterprise Network</option>
                    </select>
                  </div>
                </div>

                {/* Target Exam Checkboxes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Examinations</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    {[
                      "NBEMS Junior Assistant",
                      "SSC CHSL / CGL",
                      "DSSSB LDC / Assistant",
                      "State Govt Exams",
                    ].map((ex) => {
                      const checked = selectedExams.includes(ex);
                      return (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => toggleExam(ex)}
                          className={`p-2 rounded-lg border text-left font-medium transition ${
                            checked
                              ? "bg-blue-50 border-blue-500 text-blue-900 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {checked ? "✓ " : "+ "} {ex}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Requirements / PYQ PDF */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Past Year Papers / Specific Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. We want to test ingestion of 2023 NBEMS question PDFs with custom branding."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Zero spam guaranteed.
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-7 py-3.5 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition transform active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Demo Request...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Confirm & Schedule 30-Min Demo</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-600">Loading...</div>}>
      <BookDemoContent />
    </Suspense>
  );
}
