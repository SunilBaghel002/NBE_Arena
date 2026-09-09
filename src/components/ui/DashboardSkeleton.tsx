import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8 animate-pulse">
      {/* Hero Header & Countdown Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="h-5 w-48 bg-slate-200 rounded-full" />
          <div className="h-8 w-80 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
          <div className="h-12 w-56 bg-slate-200 rounded-xl mt-4" />
        </div>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-10 w-24 bg-slate-700 rounded-lg" />
          <div className="h-3 w-full bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* 6 KPI Cards Shimmer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-6 w-6 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-8 w-20 bg-slate-300 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Grid Row 1: Charts Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <div className="h-5 w-44 bg-slate-200 rounded" />
            <div className="h-6 w-24 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-60 bg-slate-50 rounded-xl" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <div className="h-5 w-44 bg-slate-200 rounded" />
            <div className="h-6 w-24 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-60 bg-slate-50 rounded-xl" />
        </div>
      </div>

      {/* Grid Row 2: Secondary Analytics Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-52 bg-slate-50 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-52 bg-slate-50 rounded-xl" />
        </div>
      </div>

      {/* Grid Row 3: Tables Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
