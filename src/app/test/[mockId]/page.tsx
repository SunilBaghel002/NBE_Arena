"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTestStore } from "@/store/testStore";
import { TestHeader } from "@/components/test/TestHeader";
import { QuestionCard } from "@/components/test/QuestionCard";
import { QuestionPalette } from "@/components/test/QuestionPalette";
import { SubmitModal } from "@/components/test/SubmitModal";
import { HydratedMockTest } from "@/types";
import { TestSkeleton } from "@/components/ui/TestSkeleton";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
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
        <div className="bg-white p-8 rounded-2xl shadow-md border border-exam-border text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-slate-800 mb-2">Unable to Load Mock</h2>
          <p className="text-sm text-slate-600 mb-6">{loadError}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-exam-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-exam-primaryHover transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lobby
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* CBT Fixed Header with Timer */}
      <TestHeader onSubmitClick={() => setIsSubmitModalOpen(true)} />

      {/* Main Examination Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Display (2 Columns Wide on Desktop) */}
          <div className="lg:col-span-2">
            <QuestionCard />
          </div>

          {/* Question Status Palette (1 Column Wide on Desktop) */}
          <div className="lg:col-span-1">
            <QuestionPalette />
          </div>
        </div>
      </main>

      {/* CBT Status Bar Footer */}
      <footer className="bg-white border-t border-exam-border py-2.5 px-4 text-center text-xs text-slate-500 flex items-center justify-between max-w-7xl mx-auto w-full">
        <span>NBEMS Junior Assistant Computer Based Test</span>
        <span className="hidden sm:inline">Shortcuts: [1,2,3,4] Options · [N] Next · [P] Prev · [M] Review</span>
        <span>Secure Local Session</span>
      </footer>

      {/* Confirmation Modal before Submit */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
}
