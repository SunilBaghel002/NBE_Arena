"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Database,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Layers,
  Shield,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { BankStats } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [stats, setStats] = useState<BankStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication & Role verification
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const userRole = (session?.user as unknown as { role?: string })?.role || "student";

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bank-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userRole === "admin") {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [status, userRole]);

  if (status === "loading" || (status === "authenticated" && userRole === "admin" && loading)) {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-exam-border text-center max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-exam-primary animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-base text-slate-800">Verifying Admin Access</h2>
          <p className="text-xs text-slate-500 mt-1">Connecting to repository...</p>
        </div>
      </div>
    );
  }

  // Access Denied for Students
  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-exam-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-rose-200 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-xl text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            You are signed in as <strong>{session?.user?.name || "Student"}</strong> ({userRole}). Administrator permissions are required to access the PDF extraction pipeline and question repository management.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Header */}
      <header className="bg-exam-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-exam-saffron rounded flex items-center justify-center font-black text-white text-sm">
              NBE
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg">Question Bank & Administration</h1>
              <p className="text-xs text-white/80">MongoDB Atlas Repository Management (Admin: {session?.user?.name})</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-exam-primary" /> Question Repository Pool (MongoDB Atlas)
            </h2>
            <p className="text-xs text-slate-500">
              Structured database of questions available for dynamic NBE mock generation.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStats}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Section Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
              <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                Reasoning
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{stats.bySection.REASONING}</span>
                <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
              <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                General Awareness
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{stats.bySection.GA}</span>
                <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
              <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                Quantitative Aptitude
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{stats.bySection.QUANT}</span>
                <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-exam-border shadow-sm">
              <span className="text-xs font-bold text-exam-primary uppercase tracking-wider block mb-1">
                English Comprehension
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{stats.bySection.ENGLISH}</span>
                <span className="text-xs text-slate-500 font-medium">/ 50 req</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Mock
              </p>
            </div>
          </div>
        )}

        {/* Question Sources Distribution */}
        {stats && (
          <div className="bg-white p-6 rounded-xl border border-exam-border shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-exam-primary" /> Contributing Sources in Bank
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.sources.map((src) => (
                <div
                  key={src.sourceExam}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <span className="font-semibold text-xs text-slate-700">{src.sourceExam}</span>
                  <span className="font-bold text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-900">
                    {src.count} Qs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vision PDF Ingestion Note (Stage 2 Pointer) */}
        <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">Vision LLM PDF Extraction Pipeline (Stage 2)</h4>
            <p className="leading-relaxed">
              Stage 1.5 operates with 200 seed questions synchronized with MongoDB Atlas. In Stage 2, the multimodal Vision LLM drag-drop uploader will be enabled on this page to ingest PDFs from <code>/data/pyq</code> directly into this MongoDB Atlas question repository.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-exam-muted">
        NBE Arena — Question Bank Management & Pipeline
      </footer>
    </main>
  );
}
