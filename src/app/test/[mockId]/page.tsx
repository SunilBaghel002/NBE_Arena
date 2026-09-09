"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTestStore } from "@/store/testStore";
import { TestHeader } from "@/components/test/TestHeader";
import { QuestionCard } from "@/components/test/QuestionCard";
import { QuestionPalette } from "@/components/test/QuestionPalette";
import { SubmitModal } from "@/components/test/SubmitModal";
import { InstructionsModal } from "@/components/test/InstructionsModal";
import { QuestionPaperModal } from "@/components/test/QuestionPaperModal";
import { HydratedMockTest } from "@/types";
import { TestSkeleton } from "@/components/ui/TestSkeleton";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MobilePaletteDrawer } from "@/components/test/MobilePaletteDrawer";

export default function LiveTestPage() {
  const params = useParams();
  const router = useRouter();
  const mockId = params.mockId as string;

  const {
    mockId: currentMockId,
    attemptId,
    answers,
    remainingSeconds,
    isInitialized,
    isSubmitting,
    initTest,
    tick,
    setSubmitting,
    setSubmitted,
  } = useTestStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isQuestionPaperModalOpen, setIsQuestionPaperModalOpen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const autoSubmittedRef = useRef(false);

  // 1. Fetch Mock Data & Initialize
  useEffect(() => {
    async function loadMock() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const res = await fetch(`/api/mock/${mockId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to load mock test");
        }

        const data: HydratedMockTest = await res.json();
        initTest(data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Error initializing test");
      } finally {
        setIsLoading(false);
      }
    }

    if (!isInitialized || currentMockId !== mockId) {
      loadMock();
    } else {
      setIsLoading(false);
    }
  }, [mockId, isInitialized, currentMockId, initTest]);

  // 2. Submit Handler
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !mockId || !attemptId) return;

    try {
      setSubmitting(true);
      const formattedAnswers = Object.values(answers);
      const timeTakenSeconds = 180 * 60 - remainingSeconds;

      const payload = {
        mockId,
        attemptId,
        timeTakenSeconds: Math.max(1, timeTakenSeconds),
        answers: formattedAnswers,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit test");
      }

      const result = await res.json();
      setSubmitted(true);
      setIsSubmitModalOpen(false);

      // Navigate to results screen
      router.push(`/results/${result.attemptId}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error instanceof Error ? error.message : "Submission error occurred");
      setSubmitting(false);
    }
  }, [
    isSubmitting,
    mockId,
    attemptId,
    answers,
    remainingSeconds,
    setSubmitting,
    setSubmitted,
    router,
  ]);

  // 3. Countdown Timer Interval & Auto-submit
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const timer = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timer);
  }, [isInitialized, isLoading, tick]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (isInitialized && remainingSeconds === 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit();
    }
  }, [isInitialized, remainingSeconds, handleSubmit]);

  if (isLoading) {
    return <TestSkeleton />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-exam-bg flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-200 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-slate-900 mb-2">Unable to Load Mock</h2>
          <p className="text-sm text-slate-600 mb-6">{loadError}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-exam-primaryHover transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-exam-bg flex flex-col justify-between select-none">
      {/* Universal Light CBT Header with Digital Countdown Timer */}
      <TestHeader
        onSubmitClick={() => setIsSubmitModalOpen(true)}
        onInstructionsClick={() => setIsInstructionsModalOpen(true)}
        onQuestionPaperClick={() => setIsQuestionPaperModalOpen(true)}
        onPaletteClick={() => setIsMobilePaletteOpen(true)}
      />

      {/* Main Examination Workspace: Locked 100vh viewport without page scroll */}
      <main className="max-w-[1700px] w-full mx-auto px-2 sm:px-5 lg:px-8 py-1.5 sm:py-2.5 flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full items-stretch">
          {/* Question Display & Options (Full width on mobile, 8-9 columns on desktop) */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full min-h-0 flex flex-col">
            <QuestionCard onPaletteClick={() => setIsMobilePaletteOpen(true)} />
          </div>

          {/* Question Status Palette & Candidate Console (Hidden on mobile, 4-3 columns on desktop) */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 h-full min-h-0 flex-col">
            <QuestionPalette />
          </div>
        </div>
      </main>

      {/* CBT Status Bar Footer (Slim 1-line SaaS Theme, hidden on small phones to maximize question viewport) */}
      <footer className="hidden sm:flex flex-shrink-0 bg-white border-t border-slate-200 py-1.5 px-3 sm:px-5 lg:px-8 text-[11px] text-slate-500 flex-wrap items-center justify-between gap-2 max-w-[1700px] mx-auto w-full">
        <span className="font-bold text-slate-700">
          NBEMS Junior Assistant CBT Examination 2024 · Standardized Simulation Engine
        </span>
        <span className="hidden md:inline text-slate-400 font-mono">
          Shortcuts: [1,2,3,4] Options · [N] Save & Next · [P] Prev · [M] Mark · [C] Clear
        </span>
        <span className="text-emerald-700 font-semibold flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Encrypted CBT Session · Server Latency: 14ms</span>
        </span>
      </footer>

      {/* Mobile Question Palette Bottom Sheet Drawer */}
      <MobilePaletteDrawer
        isOpen={isMobilePaletteOpen}
        onClose={() => setIsMobilePaletteOpen(false)}
      />

      {/* Confirmation Modal before Submit */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmit}
      />

      {/* In-Test Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
      />

      {/* Question Paper Overview Modal */}
      <QuestionPaperModal
        isOpen={isQuestionPaperModalOpen}
        onClose={() => setIsQuestionPaperModalOpen(false)}
      />
    </div>
  );
}
