import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-200 rounded-full" />
            <div className="h-8 w-72 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 bg-slate-100 rounded-md" />
          </div>
          <div className="h-12 w-52 bg-slate-200 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-300 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-200 p-4" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-200 p-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
