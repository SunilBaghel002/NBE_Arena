import React from "react";

export const TestSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-exam-bg flex flex-col justify-between animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-900 text-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 bg-slate-800 rounded-xl" />
            <div className="h-9 w-28 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Workspace Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Question Card Skeleton */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex justify-between border-b border-slate-100 pb-4">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-5 w-24 bg-slate-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-full bg-slate-200 rounded" />
            <div className="h-5 w-4/5 bg-slate-200 rounded" />
          </div>
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl border border-slate-200" />
            ))}
          </div>
        </div>

        {/* Right Palette Skeleton */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="grid grid-cols-5 gap-2 pt-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded-lg border border-slate-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
