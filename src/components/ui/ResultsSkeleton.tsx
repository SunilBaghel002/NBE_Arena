import React from "react";

export const ResultsSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8 animate-pulse">
      {/* Score Hero Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Net Score Counter */}
          <div className="space-y-3">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-14 w-48 bg-slate-300 rounded-xl" />
            <div className="h-3 w-64 bg-slate-100 rounded" />
          </div>

          {/* Benchmark Status */}
          <div className="h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-4">
            <div className="h-6 w-56 bg-slate-200 rounded-lg" />
          </div>

          {/* Performance Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="h-2.5 w-16 bg-slate-200 rounded" />
                <div className="h-6 w-12 bg-slate-300 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <div className="h-3 w-48 bg-slate-100 rounded" />
          <div className="flex gap-3">
            <div className="h-10 w-36 bg-slate-200 rounded-xl" />
            <div className="h-10 w-44 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Section-Wise Breakdown Cards Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-72 bg-slate-200 rounded-md" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex justify-between">
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
                <div className="h-3.5 w-14 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-16 bg-slate-50 rounded-xl border border-slate-100 p-3" />
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Palette Grid Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="h-5 w-64 bg-slate-200 rounded" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 p-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg border border-slate-200" />
          ))}
        </div>
      </div>

      {/* Solution Review Cards Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="h-6 w-80 bg-slate-200 rounded-lg" />
          <div className="h-8 w-32 bg-slate-100 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-200 p-3" />
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-50/70 rounded-2xl border border-slate-200 p-5" />
          ))}
        </div>
      </div>
    </div>
  );
};
