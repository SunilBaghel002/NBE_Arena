"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  initialTier = "SaaS Pro",
}) => {
  const [name, setName] = useState("");
  const [institute, setInstitute] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batchSize, setBatchSize] = useState("50-200");
  const [selectedExams, setSelectedExams] = useState<string[]>([
    "NBEMS Junior Assistant",
    "SSC CHSL / CGL",
  ]);
  const [tier, setTier] = useState(initialTier);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{ id?: string; message?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTier) {
      setTier(initialTier);
    }
  }, [initialTier]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 h-2 w-full" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Book an Institutional CBT Demo Call
              </h3>
              <p className="text-xs text-slate-500">
                Discuss custom batch mock papers, PDF ingestion, and white-label branding.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedLead ? (
            /* Success Feedback State */
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">Demo Request Received!</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-slate-900">{name}</span>. Our founder
                  and academic deployment team will reach out to you on WhatsApp / email within 24 hours.
                </p>
                {submittedLead.id && (
                  <span className="text-[11px] font-mono text-slate-400 block pt-1">
                    Reference Lead ID: {submittedLead.id}
                  </span>
                )}
              </div>

              {/* Direct WhatsApp Quick Chat CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/919310065542?text=${encodeURIComponent(
                    `Hi Sunil, I just requested a demo for ${institute || name} (Plan: ${tier}). Let's connect!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant WhatsApp Connect (+91 93100 65542)</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Your Name <span className="text-amber-600">*</span>
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

                {/* Institute Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Coaching / Academy Name</label>
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
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@apexacademy.in"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                  />
                </div>

                {/* Phone / WhatsApp */}
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
                {/* Batch Size */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Student Batch Size</label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="Under 50">Under 50 students (Pilot)</option>
                    <option value="50-200">50 - 200 students</option>
                    <option value="200-500">200 - 500 students</option>
                    <option value="500-1,000">500 - 1,000 students</option>
                    <option value="1,000+">1,000+ students (Enterprise Franchise)</option>
                  </select>
                </div>

                {/* Preferred Plan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Plan of Interest</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="Pilot">Pilot Batch (₹4,999 trial)</option>
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

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Specific Requirements or PYQ PDFs to Ingest (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. We have 12 past SSC CHSL & NBE PDFs and need custom branding with our academy logo."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition transform active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Book Demo Call</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
