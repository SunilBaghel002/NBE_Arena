import Link from "next/link";
import { BookOpen, Award, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-exam-bg flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-exam-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-exam-saffron rounded flex items-center justify-center font-black text-white text-lg tracking-wider">
              NBE
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">NBE ARENA</h1>
              <p className="text-xs text-white/80">NBEMS Junior Assistant CBT Simulation Platform</p>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition border border-white/20"
            >
              Admin & Question Bank
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-exam-border p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-exam-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-exam-primary" /> Official CBT Pattern Simulation
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-exam-text tracking-tight mb-4">
            National Board of Examinations in Medical Sciences
          </h2>
          <p className="text-lg text-exam-muted max-w-2xl mx-auto mb-8 font-medium">
            Junior Assistant Computer Based Test (CBT) Real-Time Examination Mock Portal
          </p>

          {/* Exam Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10 text-left">
            <div className="p-4 rounded-lg bg-exam-bg border border-exam-border">
              <div className="flex items-center gap-2 text-exam-primary mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-bold uppercase text-exam-muted">Total Questions</span>
              </div>
              <p className="text-2xl font-black text-exam-text">200 Qs</p>
              <p className="text-xs text-exam-muted mt-1">4 sections × 50</p>
            </div>

            <div className="p-4 rounded-lg bg-exam-bg border border-exam-border">
              <div className="flex items-center gap-2 text-exam-saffron mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase text-exam-muted">Time Limit</span>
              </div>
              <p className="text-2xl font-black text-exam-text">180 Min</p>
              <p className="text-xs text-exam-muted mt-1">3 Hours continuous</p>
            </div>

            <div className="p-4 rounded-lg bg-exam-bg border border-exam-border">
              <div className="flex items-center gap-2 text-exam-danger mb-1">
                <span className="font-bold text-sm">±</span>
                <span className="text-xs font-bold uppercase text-exam-muted">Negative Marking</span>
              </div>
              <p className="text-2xl font-black text-exam-danger">-0.25</p>
              <p className="text-xs text-exam-muted mt-1">+1.00 for Correct</p>
            </div>

            <div className="p-4 rounded-lg bg-exam-bg border border-exam-border">
              <div className="flex items-center gap-2 text-exam-success mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-bold uppercase text-exam-muted">Target Score</span>
              </div>
              <p className="text-2xl font-black text-exam-success">150 / 200</p>
              <p className="text-xs text-exam-muted mt-1">75% Qualifying Net</p>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto mb-8 text-sm text-amber-900 text-left">
            <p className="font-semibold mb-1">📌 Stage 0 Bootstrap Initialized</p>
            <p className="text-xs text-amber-800">
              Next.js 14, Tailwind CSS, TypeScript strict types, and UI framework are operational. Stage 1 will deliver the complete seed bank, mock generator, 180-min CBT exam hall interface, and negative-marking results engine.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-exam-border py-4 text-center text-xs text-exam-muted">
        NBE Arena — Local-first Exam Practice Platform for NBEMS Candidates
      </footer>
    </main>
  );
}
